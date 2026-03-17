insert into public.players (
  full_name,
  nickname,
  phone,
  is_goalkeeper,
  is_guest,
  is_active,
  role
)
values
  ('Lucas Lopez', 'Lucas', null, false, false, true, 'player'),
  ('Mariano Salama', 'Mariano', null, false, false, true, 'admin'),
  ('Ruben Mel', 'Ruben', null, false, false, true, 'player'),
  ('Fidel', 'Fidel', null, false, false, true, 'player'),
  ('Pacho', 'Pacho', null, false, false, true, 'player'),
  ('Esteban Larre', 'Esteban', null, false, false, true, 'player'),
  ('Guido Marani', 'Guido Marani', null, false, false, true, 'player'),
  ('Guido Muniz', 'Guido Muniz', null, false, false, true, 'player'),
  ('Fabrizio Saban', 'Fabrizio', null, false, false, true, 'player'),
  ('Atilio', 'Atilio', null, false, false, true, 'player'),
  ('Franco', 'Franco', null, false, false, true, 'player'),
  ('Nico Arquero', 'Nico Arquero', null, true, false, false, 'player')
on conflict do nothing;
