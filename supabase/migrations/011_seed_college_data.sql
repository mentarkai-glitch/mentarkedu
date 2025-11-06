-- ==================== SEED COLLEGE DATA ====================
-- Migration: 011_seed_college_data.sql
-- Purpose: Seed demo college and course data for agent functionality

-- ==================== COLLEGES SEED DATA ====================

-- Insert Top Indian Colleges
INSERT INTO colleges (id, name, short_name, type, tier, state, city, nirf_rank, nirf_year, accreditation, specializations, campus_size_acres, facilities, website_url, description, is_active, verified)
VALUES

-- IITs (Tier 1)
('11111111-1111-1111-1111-111111111111', 'Indian Institute of Technology Bombay', 'IIT Bombay', 'government', 'IIT', 'Maharashtra', 'Mumbai', 3, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Management', 'Research'], 550, ARRAY['library', 'lab', 'hostel', 'sports', 'gym'], 'https://www.iitb.ac.in', 'Premier engineering institute known for excellence in computer science and research.', true, true),

('22222222-2222-2222-2222-222222222222', 'Indian Institute of Technology Delhi', 'IIT Delhi', 'government', 'IIT', 'Delhi', 'New Delhi', 2, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Management', 'Design'], 320, ARRAY['library', 'lab', 'hostel', 'sports'], 'https://www.iitd.ac.in', 'Top-ranked IIT with strong placement record and research output.', true, true),

('33333333-3333-3333-3333-333333333333', 'Indian Institute of Technology Madras', 'IIT Madras', 'government', 'IIT', 'Tamil Nadu', 'Chennai', 1, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Management', 'Biotech'], 630, ARRAY['library', 'lab', 'hostel', 'sports', 'innovation_center'], 'https://www.iitm.ac.in', 'Number 1 IIT with excellent infrastructure and strong industry connections.', true, true),

('44444444-4444-4444-4444-444444444444', 'Indian Institute of Technology Kanpur', 'IIT Kanpur', 'government', 'IIT', 'Uttar Pradesh', 'Kanpur', 4, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Sciences', 'Aerospace'], 1050, ARRAY['library', 'lab', 'hostel', 'sports', 'airfield'], 'https://www.iitk.ac.in', 'Pioneering institute in aerospace engineering and applied mathematics.', true, true),

('55555555-5555-5555-5555-555555555555', 'Indian Institute of Technology Kharagpur', 'IIT KGP', 'government', 'IIT', 'West Bengal', 'Kharagpur', 5, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Management', 'Law'], 2100, ARRAY['library', 'lab', 'hostel', 'sports', 'research_park'], 'https://www.iitkgp.ac.in', 'Oldest and largest IIT with diverse programs and excellent placements.', true, true),

-- NITs (Tier 1.5)
('66666666-6666-6666-6666-666666666666', 'National Institute of Technology Trichy', 'NIT Trichy', 'government', 'NIT', 'Tamil Nadu', 'Tiruchirappalli', 9, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Management'], 800, ARRAY['library', 'lab', 'hostel', 'sports'], 'https://www.nitt.edu', 'Top NIT with excellent computer science and electronics programs.', true, true),

('77777777-7777-7777-7777-777777777777', 'National Institute of Technology Warangal', 'NIT Warangal', 'government', 'NIT', 'Telangana', 'Warangal', 12, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Management'], 600, ARRAY['library', 'lab', 'hostel', 'sports'], 'https://www.nitw.ac.in', 'Second oldest NIT with strong placements in core engineering.', true, true),

('88888888-8888-8888-8888-888888888888', 'National Institute of Technology Surathkal', 'NITK Surathkal', 'government', 'NIT', 'Karnataka', 'Mangalore', 14, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Management'], 295, ARRAY['library', 'lab', 'hostel', 'sports', 'beach'], 'https://www.nitk.ac.in', 'Beautiful coastal campus with strong computer science program.', true, true),

-- Medical Colleges
('99999999-9999-9999-9999-999999999999', 'All India Institute of Medical Sciences Delhi', 'AIIMS Delhi', 'government', 'AIIMS', 'Delhi', 'New Delhi', 1, 2024, ARRAY['MCI'], ARRAY['Medicine', 'Surgery', 'Research'], 300, ARRAY['hospital', 'lab', 'hostel', 'library'], 'https://www.aiims.edu', 'Premier medical institute with world-class hospitals and research facilities.', true, true),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'All India Institute of Medical Sciences Jodhpur', 'AIIMS Jodhpur', 'government', 'AIIMS', 'Rajasthan', 'Jodhpur', 18, 2024, ARRAY['MCI'], ARRAY['Medicine', 'Surgery'], 250, ARRAY['hospital', 'lab', 'hostel', 'library'], 'https://www.aiimsjodhpur.edu.in', 'Newer AIIMS with modern infrastructure and growing reputation.', true, true),

-- Top Private Universities
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Birla Institute of Technology and Science Pilani', 'BITS Pilani', 'private', 'Tier1', 'Rajasthan', 'Pilani', 20, 2024, ARRAY['UGC'], ARRAY['Engineering', 'Pharmacy', 'Management'], 328, ARRAY['library', 'lab', 'hostel', 'sports', 'innovation'], 'https://www.bits-pilani.ac.in', 'Premier private institute with unique practice school program.', true, true),

('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Vellore Institute of Technology', 'VIT Vellore', 'private', 'Tier1', 'Tamil Nadu', 'Vellore', 25, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Management', 'Law'], 380, ARRAY['library', 'lab', 'hostel', 'sports', 'incubator'], 'https://www.vit.ac.in', 'Large private university with strong industry partnerships.', true, true),

('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SRM Institute of Science and Technology', 'SRM Chennai', 'private', 'Tier1', 'Tamil Nadu', 'Chennai', 35, 2024, ARRAY['NAAC', 'UGC', 'AICTE'], ARRAY['Engineering', 'Medicine', 'Management'], 600, ARRAY['library', 'lab', 'hostel', 'sports'], 'https://www.srmist.edu.in', 'Mega university with multiple campuses and diverse programs.', true, true),

('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Manipal Academy of Higher Education', 'MAHE Manipal', 'deemed', 'Tier1', 'Karnataka', 'Manipal', 30, 2024, ARRAY['NAAC', 'UGC'], ARRAY['Engineering', 'Medicine', 'Management'], 600, ARRAY['library', 'lab', 'hostel', 'sports', 'hospital'], 'https://www.manipal.edu', 'Deemed university with excellent medical and engineering programs.', true, true);

-- ==================== COLLEGE COURSES SEED DATA ====================

-- Insert Courses for each College
INSERT INTO college_courses (id, college_id, name, degree, duration_years, specialization, intake, exam_type, fees_total, average_salary, placement_percentage, top_recruiters)
VALUES

-- IIT Bombay Courses
('f1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 120, ARRAY['JEE Main', 'JEE Advanced'], 60000, 22.5, 95, ARRAY['Google', 'Microsoft', 'Amazon', 'Goldman Sachs']),
('f2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'B.Tech Electrical Engineering', 'B.Tech', 4.0, 'Electrical', 100, ARRAY['JEE Main', 'JEE Advanced'], 60000, 18.0, 92, ARRAY['Siemens', 'ABB', 'Nvidia']),
('f3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'B.Tech Mechanical Engineering', 'B.Tech', 4.0, 'Mechanical', 120, ARRAY['JEE Main', 'JEE Advanced'], 60000, 17.5, 90, ARRAY['Toyota', 'Maruti', 'L&T']),

-- IIT Delhi Courses
('f4444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 100, ARRAY['JEE Main', 'JEE Advanced'], 65000, 23.0, 96, ARRAY['Google', 'Flipkart', 'Amazon', 'Morgan Stanley']),
('f5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'B.Tech Information Technology', 'B.Tech', 4.0, 'IT', 80, ARRAY['JEE Main', 'JEE Advanced'], 65000, 21.0, 94, ARRAY['Microsoft', 'Adobe', 'Intuit']),

-- IIT Madras Courses
('f6666666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 150, ARRAY['JEE Main', 'JEE Advanced'], 55000, 24.0, 97, ARRAY['Google', 'Apple', 'Nvidia', 'Goldman Sachs']),
('f7777777-7777-7777-7777-777777777777', '33333333-3333-3333-3333-333333333333', 'B.Tech Electronics and Communication', 'B.Tech', 4.0, 'ECE', 120, ARRAY['JEE Main', 'JEE Advanced'], 55000, 19.5, 93, ARRAY['Qualcomm', 'Broadcom', 'Intel']),

-- IIT Kanpur Courses
('f8888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 100, ARRAY['JEE Main', 'JEE Advanced'], 60000, 22.0, 95, ARRAY['Microsoft', 'Amazon', 'Samsung']),
('f9999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 'B.Tech Aerospace Engineering', 'B.Tech', 4.0, 'Aerospace', 60, ARRAY['JEE Main', 'JEE Advanced'], 60000, 18.5, 88, ARRAY['ISRO', 'DRDO', 'Airbus']),

-- IIT Kharagpur Courses
('c1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 140, ARRAY['JEE Main', 'JEE Advanced'], 58000, 21.5, 94, ARRAY['Google', 'Amazon', 'Flipkart']),
('c2222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555555', 'B.Tech Chemical Engineering', 'B.Tech', 4.0, 'Chemical', 100, ARRAY['JEE Main', 'JEE Advanced'], 58000, 17.0, 89, ARRAY['Reliance', 'IOC', 'ONGC']),

-- NIT Trichy Courses
('c3333333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 180, ARRAY['JEE Main'], 150000, 16.5, 92, ARRAY['TCS', 'Infosys', 'Amazon']),
('c4444444-4444-4444-4444-444444444444', '66666666-6666-6666-6666-666666666666', 'B.Tech Electronics and Communication', 'B.Tech', 4.0, 'ECE', 150, ARRAY['JEE Main'], 150000, 15.0, 90, ARRAY['Qualcomm', 'Mediatek', 'Samsung']),

-- NIT Warangal Courses
('c5555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 150, ARRAY['JEE Main'], 145000, 15.5, 91, ARRAY['Microsoft', 'Flipkart', 'Amazon']),
('c6666666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', 'B.Tech Mechanical Engineering', 'B.Tech', 4.0, 'Mechanical', 180, ARRAY['JEE Main'], 145000, 13.5, 87, ARRAY['L&T', 'Maruti', 'Ashok Leyland']),

-- NITK Surathkal Courses
('c7777777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 120, ARRAY['JEE Main'], 155000, 16.0, 93, ARRAY['Google', 'Amazon', 'Dell']),
('c8888888-8888-8888-8888-888888888888', '88888888-8888-8888-8888-888888888888', 'B.Tech Information Technology', 'B.Tech', 4.0, 'IT', 90, ARRAY['JEE Main'], 155000, 15.2, 91, ARRAY['SAP', 'Oracle', 'Zoho']),

-- AIIMS Delhi Courses
('c9999999-9999-9999-9999-999999999999', '99999999-9999-9999-9999-999999999999', 'MBBS', 'MBBS', 5.5, 'General Medicine', 125, ARRAY['NEET'], 3000, 25.0, 100, ARRAY['AIIMS', 'Government Hospitals', 'PG Programs']),
('c0000000-0000-0000-0000-000000000001', '99999999-9999-9999-9999-999999999999', 'B.Sc Nursing', 'B.Sc', 4.0, 'Nursing', 60, ARRAY['AIIMS Entrance'], 5000, 8.0, 95, ARRAY['Hospitals', 'Research Labs']),

-- AIIMS Jodhpur Courses
('c0000000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MBBS', 'MBBS', 5.5, 'General Medicine', 150, ARRAY['NEET'], 3500, 22.0, 100, ARRAY['Hospitals', 'PG Programs']),

-- BITS Pilani Courses
('c0000000-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B.E Computer Science', 'B.E', 4.0, 'Computer Science', 300, ARRAY['BITSAT'], 350000, 20.5, 96, ARRAY['Microsoft', 'Amazon', 'Goldman Sachs']),
('c0000000-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'B.Pharm', 'B.Pharm', 4.0, 'Pharmacy', 150, ARRAY['BITSAT'], 320000, 12.0, 88, ARRAY['Pharma Companies', 'Hospitals']),

-- VIT Vellore Courses
('c0000000-0000-0000-0000-000000000005', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 600, ARRAY['VITEEE'], 200000, 12.5, 89, ARRAY['TCS', 'Infosys', 'Cognizant']),
('c0000000-0000-0000-0000-000000000006', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'B.Tech Electronics and Communication', 'B.Tech', 4.0, 'ECE', 450, ARRAY['VITEEE'], 200000, 11.0, 87, ARRAY['Qualcomm', 'Intel', 'Samsung']),

-- SRM Chennai Courses
('c0000000-0000-0000-0000-000000000007', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 800, ARRAY['SRMJEE'], 250000, 10.5, 85, ARRAY['TCS', 'Wipro', 'Infosys']),
('c0000000-0000-0000-0000-000000000008', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'MBBS', 'MBBS', 5.5, 'General Medicine', 200, ARRAY['NEET'], 1800000, 20.0, 98, ARRAY['SRM Hospitals', 'PG Programs']),

-- MAHE Manipal Courses
('c0000000-0000-0000-0000-000000000009', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'B.Tech Computer Science and Engineering', 'B.Tech', 4.0, 'Computer Science', 400, ARRAY['MET'], 300000, 14.5, 91, ARRAY['Microsoft', 'Amazon', 'Accenture']),
('c0000000-0000-0000-0000-000000000010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'MBBS', 'MBBS', 5.5, 'General Medicine', 250, ARRAY['NEET'], 2000000, 23.0, 99, ARRAY['Manipal Hospitals', 'PG Programs']);

-- ==================== CUTOFF DATA ====================

-- Insert historical cutoff data and predictions
INSERT INTO cutoff_predictions (id, college_id, course_id, target_year, predicted_cutoff_general, predicted_cutoff_obc, predicted_cutoff_sc, predicted_cutoff_st, predicted_cutoff_ews, prediction_confidence, methodology, pessimistic_cutoff, optimistic_cutoff, trend_direction, trend_magnitude, last_5_years_avg, standard_deviation)
VALUES

-- IIT Bombay CS - Top course
('c0000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 2025, 95, 480, 1200, 1500, 380, 85, 'ensemble_trend_ai', 85, 110, 'rising', 5.5, 90, 8.2),
('c0000000-0000-0000-0000-000000000012', '22222222-2222-2222-2222-222222222222', 'f4444444-4444-4444-4444-444444444444', 2025, 120, 550, 1400, 1800, 450, 82, 'ensemble_trend_ai', 105, 140, 'stable', 2.1, 115, 10.5),
('c0000000-0000-0000-0000-000000000013', '33333333-3333-3333-3333-333333333333', 'f6666666-6666-6666-6666-666666666666', 2025, 80, 380, 1000, 1200, 310, 88, 'ensemble_trend_ai', 72, 95, 'falling', -3.2, 85, 6.8),
('c0000000-0000-0000-0000-000000000014', '44444444-4444-4444-4444-444444444444', 'f8888888-8888-8888-8888-888888888888', 2025, 180, 850, 2000, 2800, 650, 80, 'ensemble_trend_ai', 160, 210, 'rising', 4.8, 170, 15.2),
('c0000000-0000-0000-0000-000000000015', '55555555-5555-5555-5555-555555555555', 'c1111111-1111-1111-1111-111111111111', 2025, 200, 950, 2200, 3000, 720, 78, 'ensemble_trend_ai', 180, 235, 'stable', 1.5, 195, 18.5),
('c0000000-0000-0000-0000-000000000016', '66666666-6666-6666-6666-666666666666', 'c3333333-3333-3333-3333-333333333333', 2025, 2500, 8000, 15000, 25000, 6000, 75, 'ensemble_trend_ai', 2200, 2900, 'rising', 6.2, 2300, 250),
('c0000000-0000-0000-0000-000000000017', '77777777-7777-7777-7777-777777777777', 'c5555555-5555-5555-5555-555555555555', 2025, 2800, 9000, 16000, 26000, 6800, 73, 'ensemble_trend_ai', 2500, 3200, 'stable', 2.8, 2750, 280),
('c0000000-0000-0000-0000-000000000018', '88888888-8888-8888-8888-888888888888', 'c7777777-7777-7777-7777-777777777777', 2025, 3200, 10000, 17000, 28000, 7500, 70, 'ensemble_trend_ai', 2800, 3700, 'rising', 5.5, 3050, 350),
('c0000000-0000-0000-0000-000000000019', '99999999-9999-9999-9999-999999999999', 'c9999999-9999-9999-9999-999999999999', 2025, 50, 120, 500, 700, 95, 90, 'ensemble_trend_ai', 45, 60, 'rising', 3.5, 48, 5.2);

-- ==================== COMMENTS ====================

COMMENT ON TABLE colleges IS 'Seed data: 15 top Indian colleges including IITs, NITs, AIIMS, and private universities';
COMMENT ON TABLE college_courses IS 'Seed data: 25+ courses across engineering and medical fields';
COMMENT ON TABLE cutoff_predictions IS 'Seed data: Sample cutoff predictions for 2025 admissions';
