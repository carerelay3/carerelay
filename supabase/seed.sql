-- Demo seed for CareRelay MVP
insert into care_circles (id, name, sms_keyword, shared_phone_number, demo_mode)
values ('00000000-0000-0000-0000-000000000001', 'Linda''s Care Circle', 'LINDA', '+15551230000', true)
on conflict do nothing;

insert into care_recipients (id, care_circle_id, first_name, relationship, notes)
values ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Linda', 'Mother', 'Needs family coordination support')
on conflict do nothing;
