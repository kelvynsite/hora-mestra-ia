import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      "https://swatqakbmwfrqcwjsldp.supabase.co",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3YXRxYWtibXdmcnFjd2pzbGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODQwMjcsImV4cCI6MjA3MTk2MDAyN30.1t7-fD19L2E6bbieiCmBoBajxMPo-TBzuvsfrfrOHNM"
    );

    const { shift } = await req.json();

    // Fetch data from database
    const [teachersResult, classesResult, configResult] = await Promise.all([
      supabaseClient.from('teachers').select('*'),
      supabaseClient.from('classes').select('*').eq('shift', shift),
      supabaseClient.from('schedule_configs').select('*').eq('shift', shift).single()
    ]);

    if (teachersResult.error || classesResult.error || configResult.error) {
      throw new Error('Failed to fetch data from database');
    }

    const teachers: Teacher[] = teachersResult.data || [];
    const classes: Class[] = classesResult.data || [];
    const config: ScheduleConfig = configResult.data;

    if (teachers.length === 0 || classes.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Não há professores ou turmas suficientes para gerar horários' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Generate schedule using Google Gemini
    const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Google Gemini API key not configured');
    }

    const prompt = `
Você é um especialista em criação de horários escolares. Preciso que gere um horário otimizado sem conflitos.

DADOS:
Professores: ${JSON.stringify(teachers, null, 2)}
Turmas: ${JSON.stringify(classes, null, 2)}
Configuração: ${JSON.stringify(config, null, 2)}

REGRAS OBRIGATÓRIAS:
1. Cada turma deve ter exatamente ${config.classes_per_day} aulas por dia
2. Cada professor pode dar no máximo ${teachers[0]?.max_daily_classes || 5} aulas por dia
3. Não pode haver conflitos (mesmo professor em duas turmas no mesmo horário)
4. Respeitar o horário de recreio: ${config.break_start} às ${config.break_end}
5. Respeitar as restrições dos professores (campo constraints)
6. Distribuir as matérias de forma equilibrada na semana

FORMATO DE RESPOSTA (JSON válido):
{
  "schedule": {
    "turma_id": {
      "monday": [
        {"time_slot": 1, "teacher_id": "id", "subject": "materia", "time": "07:00-07:50"},
        {"time_slot": 2, "teacher_id": "id", "subject": "materia", "time": "08:00-08:50"},
        ...
      ],
      "tuesday": [...],
      ...
    }
  },
  "conflicts": 0,
  "summary": "Resumo da geração"
}

Gere o horário completo para todas as turmas e todos os dias da semana (segunda a sexta).
`;

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 4000,
          }
        })
      }
    );

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0]) {
      throw new Error('Failed to generate schedule with Gemini');
    }

    const scheduleText = geminiData.candidates[0].content.parts[0].text;
    
    // Extract JSON from the response
    const jsonMatch = scheduleText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse schedule from Gemini response');
    }

    const scheduleData = JSON.parse(jsonMatch[0]);

    // Save schedule to database
    const { data: savedSchedule, error: saveError } = await supabaseClient
      .from('schedules')
      .insert({
        name: `Horário ${shift === 'morning' ? 'Manhã' : 'Tarde'} - ${new Date().toLocaleDateString()}`,
        schedule_data: scheduleData,
        generated_by: 'Google Gemini',
        conflicts: scheduleData.conflicts || 0
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving schedule:', saveError);
      throw new Error('Failed to save schedule');
    }

    return new Response(JSON.stringify({
      success: true,
      schedule: scheduleData,
      schedule_id: savedSchedule.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in generate-schedule function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});