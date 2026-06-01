-- Run this if you already ran schema.sql — adds features column to doctors
alter table doctors add column if not exists features jsonb default '{"appointments":30,"prescriptions":false,"shop":false,"blog":false,"custom_domain":false,"max_patients":50}';

-- Update existing doctors based on their plan
update doctors set features = '{"appointments":30,"prescriptions":false,"shop":false,"blog":false,"custom_domain":false,"max_patients":50}' where plan = 'free';
update doctors set features = '{"appointments":200,"prescriptions":true,"shop":false,"blog":true,"custom_domain":false,"max_patients":500}' where plan = 'starter';
update doctors set features = '{"appointments":-1,"prescriptions":true,"shop":true,"blog":true,"custom_domain":true,"max_patients":-1}' where plan = 'pro';
