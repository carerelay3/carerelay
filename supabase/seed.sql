-- Demo seed for CareRelay MVP
insert into care_circles (id, name, shared_phone_number, summary_time, timezone, mode)
values ('00000000-0000-0000-0000-000000000001', 'Linda''s Care Circle', '+15551230000', '18:00', 'America/New_York', 'demo')
on conflict do nothing;

insert into care_recipients (id, care_circle_id, first_name, last_name, age, relationship, general_notes)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Linda', 'Matthews', 78, 'Mother', 'Needs family coordination support')
on conflict do nothing;
