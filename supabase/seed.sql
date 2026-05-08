-- ============================================================
-- Справочник маркеров (гормоны, анализы)
-- Источник норм: согласовать с медицинским экспертом
-- ============================================================

insert into markers (code, name_ru, name_en, category, default_unit, sort_order) values
  -- Половые гормоны
  ('fsh',         'ФСГ',                    'FSH',          'hormones',   'мМЕ/мл',  10),
  ('lh',          'ЛГ',                     'LH',           'hormones',   'мМЕ/мл',  20),
  ('estradiol',   'Эстрадиол',              'Estradiol',    'hormones',   'пг/мл',   30),
  ('progesterone','Прогестерон',             'Progesterone', 'hormones',   'нг/мл',   40),
  ('testosterone','Тестостерон общий',       'Testosterone', 'hormones',   'нмоль/л', 50),
  ('free_testo',  'Тестостерон свободный',   'Free Testo',   'hormones',   'пг/мл',   60),
  ('dhea_s',      'ДГЭА-С',                 'DHEA-S',       'hormones',   'мкг/дл',  70),
  ('shbg',        'ГСПГ',                   'SHBG',         'hormones',   'нмоль/л', 80),
  ('oh17_prog',   '17-ОН-прогестерон',       '17-OH Prog',   'hormones',   'нг/мл',   90),
  ('amh',         'АМГ',                    'AMH',          'hormones',   'нг/мл',  100),
  ('inhibin_b',   'Ингибин В',              'Inhibin B',    'hormones',   'пг/мл',  110),
  -- Щитовидная железа
  ('tsh',         'ТТГ',                    'TSH',          'thyroid',    'мМЕ/л',  200),
  ('ft4',         'Т4 свободный',            'Free T4',      'thyroid',    'пмоль/л',210),
  ('ft3',         'Т3 свободный',            'Free T3',      'thyroid',    'пмоль/л',220),
  ('anti_tpo',    'АТ-ТПО',                 'Anti-TPO',     'thyroid',    'МЕ/мл',  230),
  ('anti_tg',     'АТ-ТГ',                  'Anti-TG',      'thyroid',    'МЕ/мл',  240),
  -- Пролактин и стресс
  ('prolactin',   'Пролактин',              'Prolactin',    'hormones',   'нг/мл',  300),
  ('cortisol',    'Кортизол',               'Cortisol',     'hormones',   'нмоль/л',310),
  -- Углеводный обмен
  ('glucose',     'Глюкоза натощак',         'Fasting Glucose','metabolism','ммоль/л',400),
  ('insulin',     'Инсулин',                'Insulin',      'metabolism', 'мкМЕ/мл',410),
  ('homa_ir',     'HOMA-IR',                'HOMA-IR',      'metabolism', '',        420),
  ('hba1c',       'HbA1c',                  'HbA1c',        'metabolism', '%',       430),
  -- Витамины и метаболизм
  ('vit_d',       'Витамин D (25-OH)',       'Vitamin D',    'vitamins',   'нг/мл',  500),
  ('b12',         'Витамин B12',            'Vitamin B12',  'vitamins',   'пг/мл',  510),
  ('ferritin',    'Ферритин',               'Ferritin',     'vitamins',   'нг/мл',  520),
  ('iron',        'Железо',                 'Iron',         'vitamins',   'мкмоль/л',530),
  ('tibc',        'ОЖСС',                   'TIBC',         'vitamins',   'мкмоль/л',540),
  -- Общая клиника
  ('hemoglobin',  'Гемоглобин',             'Hemoglobin',   'general',    'г/л',    600),
  ('rbc',         'Эритроциты',             'RBC',          'general',    '×10¹²/л',610),
  ('wbc',         'Лейкоциты',              'WBC',          'general',    '×10⁹/л', 620)
on conflict (code) do nothing;

-- ============================================================
-- Референсные диапазоны (заглушки — уточнить с врачом!)
-- condition: 'default', 'follicular', 'ovulatory', 'luteal', 'menopause'
-- source: пока placeholder, заменить на конкретные рекомендации
-- ============================================================

insert into marker_references (marker_id, condition, reference_low, reference_high, unit, source)
select m.id, v.condition, v.ref_low, v.ref_high, m.default_unit,
       'PLACEHOLDER — согласовать с медицинским экспертом'
from (values
  ('fsh', 'follicular',  3.5,  12.5),
  ('fsh', 'ovulatory',   4.7,  21.5),
  ('fsh', 'luteal',      1.7,   7.7),
  ('lh',  'follicular',  2.4,  12.6),
  ('lh',  'ovulatory',  14.0,  95.6),
  ('lh',  'luteal',      1.0,  11.4),
  ('estradiol', 'follicular', 12.5, 166.0),
  ('estradiol', 'ovulatory',  85.8, 498.0),
  ('estradiol', 'luteal',     43.8, 211.0),
  ('progesterone', 'follicular', 0.2,  1.5),
  ('progesterone', 'ovulatory',  0.8,  3.0),
  ('progesterone', 'luteal',     1.7, 27.0),
  ('prolactin', 'default',  4.8, 23.3),
  ('tsh', 'default',  0.27, 4.2),
  ('ft4', 'default', 12.0, 22.0),
  ('ft3', 'default',  3.1,  6.8),
  ('glucose', 'default', 3.9,  5.8),
  ('insulin', 'default', 2.6, 24.9),
  ('homa_ir', 'default', 0.0,  2.7),
  ('hba1c', 'default', 4.0, 5.6),
  ('vit_d', 'default', 30.0, 100.0),
  ('ferritin', 'default', 10.0, 120.0),
  ('hemoglobin', 'default', 120.0, 150.0)
) as v(marker_code, condition, ref_low, ref_high)
join markers m on m.code = v.marker_code;
