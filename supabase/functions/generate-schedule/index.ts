const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

interface Teacher {
  id: string;
  name: string;
  subject: string;
  max_daily_classes: number;
  constraints: any;
}

interface Class {
  id: string;
  name: string;
  grade: string;
  shift: string;
  school_level: string;
}

interface ScheduleConfig {
  start_time: string;
  end_time: string;
  class_duration: number;
  break_start: string;
  break_end: string;
  classes_per_day: number;
  shift: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    const { shift } = await req.json();

    console.log('Generating schedule for shift:', shift);

    // Fetch data from database
    const [teachersResult, classesResult] = await Promise.all([
      supabaseClient.from('teachers').select('*'),
      supabaseClient.from('classes').select('*').eq('shift', shift)
    ]);

    console.log('Teachers result:', teachersResult);
    console.log('Classes result:', classesResult);

    if (teachersResult.error) {
      console.error('Error fetching teachers:', teachersResult.error);
      throw new Error('Failed to fetch teachers from database');
    }

    if (classesResult.error) {
      console.error('Error fetching classes:', classesResult.error);
      throw new Error('Failed to fetch classes from database');
    }

    const teachers: Teacher[] = teachersResult.data || [];
    const classes: Class[] = classesResult.data || [];

    console.log('Found teachers:', teachers.length);
    console.log('Found classes:', classes.length);

    if (teachers.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Nenhum professor cadastrado no sistema. Adicione professores primeiro.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (classes.length === 0) {
      return new Response(JSON.stringify({ 
        error: `Nenhuma turma cadastrada para o turno ${shift === 'morning' ? 'da manhã' : 'da tarde'}. Adicione turmas primeiro.` 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Default schedule config
    const config: ScheduleConfig = {
      start_time: shift === 'morning' ? '07:00:00' : '13:00:00',
      end_time: shift === 'morning' ? '12:00:00' : '18:00:00',
      class_duration: 50,
      break_start: shift === 'morning' ? '09:50:00' : '15:50:00',
      break_end: shift === 'morning' ? '10:10:00' : '16:10:00',
      classes_per_day: 5,
      shift: shift
    };

    // Generate a simple schedule without AI for now
    const timeSlots = [
      { slot: 1, time: shift === 'morning' ? '07:00-07:50' : '13:00-13:50' },
      { slot: 2, time: shift === 'morning' ? '08:00-08:50' : '14:00-14:50' },
      { slot: 3, time: shift === 'morning' ? '09:00-09:50' : '15:00-15:50' },
      { slot: 4, time: shift === 'morning' ? '10:10-11:00' : '16:10-17:00' },
      { slot: 5, time: shift === 'morning' ? '11:10-12:00' : '17:10-18:00' }
    ];

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const subjects = ['Matemática', 'Português', 'História', 'Geografia', 'Ciências', 'Inglês', 'Arte', 'Educação Física'];

    const schedule: any = {};

    // Generate schedule for each class
    classes.forEach((classItem) => {
      schedule[classItem.id] = {};
      
      days.forEach((day) => {
        schedule[classItem.id][day] = [];
        
        timeSlots.forEach((timeSlot) => {
          // Simple round-robin assignment
          const subjectIndex = (timeSlot.slot - 1) % subjects.length;
          const teacherIndex = (timeSlot.slot - 1) % teachers.length;
          
          schedule[classItem.id][day].push({
            time_slot: timeSlot.slot,
            teacher_id: teachers[teacherIndex].id,
            teacher_name: teachers[teacherIndex].name,
            subject: subjects[subjectIndex],
            time: timeSlot.time,
            class_id: classItem.id,
            class_name: classItem.name
          });
        });
      });
    });

    const scheduleData = {
      schedule: schedule,
      conflicts: 0,
      summary: `Horário gerado para ${classes.length} turma(s) do turno ${shift === 'morning' ? 'da manhã' : 'da tarde'} com ${teachers.length} professor(es).`,
      shift: shift,
      generated_at: new Date().toISOString()
    };

    // Save schedule to database
    const { data: savedSchedule, error: saveError } = await supabaseClient
      .from('schedules')
      .insert({
        name: `Horário ${shift === 'morning' ? 'Manhã' : 'Tarde'} - ${new Date().toLocaleDateString('pt-BR')}`,
        schedule_data: scheduleData,
        generated_by: 'Sistema Automático',
        conflicts: 0
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving schedule:', saveError);
      throw new Error('Failed to save schedule to database');
    }

    console.log('Schedule saved successfully:', savedSchedule.id);

    return new Response(JSON.stringify({
      success: true,
      schedule: scheduleData,
      schedule_id: savedSchedule.id,
      message: 'Horário gerado com sucesso!'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-schedule function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});