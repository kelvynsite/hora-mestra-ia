-- Insert sample classes for testing
INSERT INTO public.classes (name, grade, school_level, shift) VALUES
('6º A', '6º Ano', 'fundamental2', 'morning'),
('7º A', '7º Ano', 'fundamental2', 'morning'),
('8º A', '8º Ano', 'fundamental2', 'afternoon'),
('9º A', '9º Ano', 'fundamental2', 'afternoon'),
('1º EM A', '1º Ano', 'medio', 'morning');

-- Insert sample teachers for testing
INSERT INTO public.teachers (name, subject, max_daily_classes, constraints) VALUES
('Maria Silva', 'Matemática', 5, '{"subjects": ["Matemática", "Física"], "preferences": "Prefere aulas no período da manhã", "unavailableSlots": ["17:00 - 17:50"], "assignedClasses": []}'),
('João Santos', 'Português', 6, '{"subjects": ["Português", "Redação"], "preferences": "Pode dar aulas em qualquer horário", "unavailableSlots": [], "assignedClasses": []}'),
('Ana Costa', 'História', 4, '{"subjects": ["História", "Geografia"], "preferences": "Não gosta de aulas na primeira hora", "unavailableSlots": ["07:00 - 07:50"], "assignedClasses": []}'),
('Carlos Oliveira', 'Ciências', 5, '{"subjects": ["Ciências", "Biologia"], "preferences": "Prefere turmas do ensino fundamental", "unavailableSlots": ["16:00 - 16:50", "17:00 - 17:50"], "assignedClasses": []}'),
('Lucia Pereira', 'Inglês', 6, '{"subjects": ["Inglês"], "preferences": "Disponível para todos os horários", "unavailableSlots": [], "assignedClasses": []}'),
('Roberto Lima', 'Educação Física', 8, '{"subjects": ["Educação Física"], "preferences": "Prefere aulas duplas", "unavailableSlots": ["11:10 - 12:00"], "assignedClasses": []}'),
('Fernanda Alves', 'Química', 4, '{"subjects": ["Química", "Física"], "preferences": "Precisa de laboratório", "unavailableSlots": ["13:00 - 13:50"], "assignedClasses": []}'),
('Paulo Souza', 'Artes', 3, '{"subjects": ["Artes", "Música"], "preferences": "Trabalha com projetos interdisciplinares", "unavailableSlots": ["15:00 - 15:50", "16:00 - 16:50"], "assignedClasses": []}'),
('Camila Rodrigues', 'Filosofia', 4, '{"subjects": ["Filosofia", "Sociologia"], "preferences": "Prefere turmas do ensino médio", "unavailableSlots": ["10:10 - 11:00"], "assignedClasses": []}'),
('Diego Martins', 'Matemática', 6, '{"subjects": ["Matemática", "Estatística"], "preferences": "Especialista em ensino médio", "unavailableSlots": ["14:00 - 14:50"], "assignedClasses": []}');