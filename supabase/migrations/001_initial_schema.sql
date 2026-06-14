-- =====================================================================
-- Dupplo OS V1 — Esquema inicial + datos de ejemplo (Chile)
-- Ejecutar en Supabase: SQL Editor > New query > pegar > Run
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- Tipos enumerados ----------
do $$ begin
  create type oc_tipo as enum ('cliente', 'proveedor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type factura_tipo as enum ('emitida', 'recibida');
exception when duplicate_object then null; end $$;

-- ---------- Tablas ----------
create table if not exists personal (
  id uuid primary key default gen_random_uuid(),
  rut text,
  nombre text not null,
  apellido text,
  email_corporativo text,
  cargo text,
  departamento text,
  tipo_contrato text,
  fecha_ingreso date,
  estado text default 'activo',
  user_id uuid,
  created_at timestamptz default now()
);

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  rut text,
  razon_social text not null,
  tipo text,
  email text,
  telefono text,
  condicion_pago text,
  estado text default 'activo',
  ejecutivo_id uuid references personal(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

create table if not exists proveedores (
  id uuid primary key default gen_random_uuid(),
  rut text,
  razon_social text not null,
  tipo text,
  categoria text,
  email text,
  telefono text,
  condicion_pago text,
  estado text default 'activo',
  created_at timestamptz default now()
);

create table if not exists proyectos (
  id uuid primary key default gen_random_uuid(),
  codigo text,
  nombre text not null,
  cliente_id uuid references clientes(id),
  tipo text,
  estado text default 'pendiente',
  fecha_inicio date,
  fecha_fin_estimada date,
  presupuesto_total numeric default 0,
  currency text default 'CLP',
  responsable_id uuid references personal(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cotizaciones (
  id uuid primary key default gen_random_uuid(),
  numero text,
  proyecto_id uuid references proyectos(id),
  cliente_id uuid references clientes(id),
  version int default 1,
  estado text default 'borrador',
  fecha_emision date,
  fecha_validez date,
  subtotal numeric default 0,
  descuento_pct numeric default 0,
  impuesto_pct numeric default 19,
  impuesto_monto numeric default 0,
  total numeric default 0,
  currency text default 'CLP',
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists cotizacion_items (
  id uuid primary key default gen_random_uuid(),
  cotizacion_id uuid references cotizaciones(id) on delete cascade,
  linea int,
  descripcion text,
  unidad text,
  cantidad numeric default 1,
  precio_unitario numeric default 0,
  subtotal numeric default 0
);

create table if not exists ordenes_compra (
  id uuid primary key default gen_random_uuid(),
  numero text,
  tipo oc_tipo not null default 'proveedor',
  proyecto_id uuid references proyectos(id),
  cotizacion_id uuid references cotizaciones(id),
  cliente_id uuid references clientes(id),
  proveedor_id uuid references proveedores(id),
  estado text default 'pendiente',
  fecha_emision date,
  total numeric default 0,
  currency text default 'CLP',
  created_at timestamptz default now()
);

create table if not exists facturas (
  id uuid primary key default gen_random_uuid(),
  numero_folio text,
  tipo factura_tipo not null default 'emitida',
  proyecto_id uuid references proyectos(id),
  oc_id uuid references ordenes_compra(id),
  cliente_id uuid references clientes(id),
  proveedor_id uuid references proveedores(id),
  estado text default 'pendiente',
  fecha_emision date,
  fecha_vencimiento date,
  neto numeric default 0,
  iva numeric default 0,
  total numeric default 0,
  currency text default 'CLP',
  created_at timestamptz default now()
);

create table if not exists cobros (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid references facturas(id),
  cliente_id uuid references clientes(id),
  monto numeric default 0,
  currency text default 'CLP',
  fecha_programada date,
  fecha_cobrado date,
  estado text default 'pendiente',
  metodo_pago text,
  referencia_pago text,
  created_at timestamptz default now()
);

create table if not exists obras (
  id uuid primary key default gen_random_uuid(),
  codigo text,
  nombre text not null,
  proyecto_id uuid references proyectos(id),
  cliente_id uuid references clientes(id),
  tipo text,
  estado text default 'pendiente',
  direccion text,
  fecha_inicio_plan date,
  fecha_fin_plan date,
  presupuesto numeric default 0,
  costo_real numeric default 0,
  avance_pct numeric default 0,
  jefe_obra_id uuid references personal(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- Row Level Security ----------
-- MVP: habilitar RLS con política de lectura/escritura para usuarios autenticados.
-- Ajusta según tus necesidades de seguridad.
do $$
declare t text;
begin
  foreach t in array array['personal','clientes','proveedores','proyectos','cotizaciones',
    'cotizacion_items','ordenes_compra','facturas','cobros','obras']
  loop
    execute format('alter table %I enable row level security;', t);
    execute format('drop policy if exists "auth_all" on %I;', t);
    execute format('create policy "auth_all" on %I for all to authenticated using (true) with check (true);', t);
    -- Lectura pública anónima (opcional, útil para demo). Comenta si no la quieres.
    execute format('drop policy if exists "anon_read" on %I;', t);
    execute format('create policy "anon_read" on %I for select to anon using (true);', t);
  end loop;
end $$;

-- =====================================================================
-- DATOS DE EJEMPLO
-- =====================================================================
-- Personal (8)
insert into personal (id, rut, nombre, apellido, email_corporativo, cargo, departamento, tipo_contrato, fecha_ingreso, estado) values
('11111111-0000-0000-0000-000000000001','15.234.567-8','Andrea','Soto','andrea.soto@dupplo.cl','Gerente Comercial','Comercial','indefinido','2021-03-01','activo'),
('11111111-0000-0000-0000-000000000002','16.876.543-2','Cristóbal','Vega','cristobal.vega@dupplo.cl','Jefe de Obra','Operaciones','indefinido','2020-07-15','activo'),
('11111111-0000-0000-0000-000000000003','17.445.221-9','María José','Reyes','mj.reyes@dupplo.cl','Ejecutiva de Ventas','Comercial','indefinido','2022-01-10','activo'),
('11111111-0000-0000-0000-000000000004','13.998.776-5','Rodrigo','Muñoz','rodrigo.munoz@dupplo.cl','Jefe de Obra','Operaciones','plazo_fijo','2023-05-02','activo'),
('11111111-0000-0000-0000-000000000005','18.332.110-K','Valentina','Castro','valentina.castro@dupplo.cl','Analista de Finanzas','Finanzas','indefinido','2021-11-20','activo'),
('11111111-0000-0000-0000-000000000006','12.556.889-1','Felipe','Inspector','felipe.inspector@dupplo.cl','CEO','Dirección','indefinido','2018-01-01','activo'),
('11111111-0000-0000-0000-000000000007','19.221.443-7','Tomás','Fuentes','tomas.fuentes@dupplo.cl','Prevencionista','Operaciones','plazo_fijo','2024-02-01','activo'),
('11111111-0000-0000-0000-000000000008','14.778.221-3','Daniela','Pino','daniela.pino@dupplo.cl','Administrativa','Administración','indefinido','2020-09-12','inactivo')
on conflict (id) do nothing;

-- Clientes (5)
insert into clientes (id, rut, razon_social, tipo, email, telefono, condicion_pago, estado, ejecutivo_id) values
('22222222-0000-0000-0000-000000000001','76.123.456-7','Inmobiliaria Los Andes SpA','empresa','contacto@losandes.cl','+56 2 2345 6789','30 días','activo','11111111-0000-0000-0000-000000000003'),
('22222222-0000-0000-0000-000000000002','77.998.221-3','Constructora Vista Norte Ltda','empresa','compras@vistanorte.cl','+56 2 2987 1122','60 días','activo','11111111-0000-0000-0000-000000000001'),
('22222222-0000-0000-0000-000000000003','78.445.667-9','Retail Sur S.A.','empresa','proyectos@retailsur.cl','+56 41 222 3344','45 días','activo','11111111-0000-0000-0000-000000000003'),
('22222222-0000-0000-0000-000000000004','9.887.554-2','Juan Pérez Hernández','persona','jperez@gmail.com','+56 9 8877 6655','contado','activo','11111111-0000-0000-0000-000000000001'),
('22222222-0000-0000-0000-000000000005','76.554.332-1','Municipalidad de Quilpué','publico','obras@quilpue.cl','+56 32 234 5566','90 días','inactivo','11111111-0000-0000-0000-000000000003')
on conflict (id) do nothing;

-- Proveedores (4)
insert into proveedores (id, rut, razon_social, tipo, categoria, email, telefono, condicion_pago, estado) values
('33333333-0000-0000-0000-000000000001','76.222.111-0','Aceros del Pacífico Ltda','empresa','Materiales','ventas@aceros.cl','+56 2 2444 5566','30 días','activo'),
('33333333-0000-0000-0000-000000000002','77.333.222-K','Hormigones Premix S.A.','empresa','Materiales','pedidos@premix.cl','+56 2 2555 6677','contado','activo'),
('33333333-0000-0000-0000-000000000003','78.444.333-5','Arriendos Maquinaria Norte','empresa','Maquinaria','arriendo@maqnorte.cl','+56 55 233 4455','30 días','activo'),
('33333333-0000-0000-0000-000000000004','79.555.444-2','Eléctrica Andina SpA','empresa','Subcontrato','contacto@electandina.cl','+56 2 2666 7788','45 días','activo')
on conflict (id) do nothing;

-- Proyectos (3)
insert into proyectos (id, codigo, nombre, cliente_id, tipo, estado, fecha_inicio, fecha_fin_estimada, presupuesto_total, responsable_id) values
('44444444-0000-0000-0000-000000000001','PRY-2026-001','Edificio Mirador Las Condes','22222222-0000-0000-0000-000000000001','construccion','en_proceso','2026-01-15','2026-12-20',850000000,'11111111-0000-0000-0000-000000000002'),
('44444444-0000-0000-0000-000000000002','PRY-2026-002','Remodelación Mall Vista Norte','22222222-0000-0000-0000-000000000002','remodelacion','en_proceso','2026-03-01','2026-09-30',420000000,'11111111-0000-0000-0000-000000000004'),
('44444444-0000-0000-0000-000000000003','PRY-2026-003','Local Comercial Retail Sur','22222222-0000-0000-0000-000000000003','construccion','pendiente','2026-07-01','2026-11-15',180000000,'11111111-0000-0000-0000-000000000002')
on conflict (id) do nothing;

-- Cotizaciones (5)
insert into cotizaciones (id, numero, proyecto_id, cliente_id, version, estado, fecha_emision, fecha_validez, subtotal, descuento_pct, impuesto_pct, impuesto_monto, total, notas) values
('55555555-0000-0000-0000-000000000001','COT-2026-0012','44444444-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001',2,'aprobada','2026-01-05','2026-02-05',850000000,0,19,161500000,1011500000,'Incluye obra gruesa y terminaciones'),
('55555555-0000-0000-0000-000000000002','COT-2026-0021','44444444-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002',1,'aprobada','2026-02-20','2026-03-20',420000000,5,19,75810000,474810000,null),
('55555555-0000-0000-0000-000000000003','COT-2026-0030','44444444-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000003',1,'en_revision','2026-05-28','2026-06-28',180000000,0,19,34200000,214200000,'Pendiente aprobación de planos'),
('55555555-0000-0000-0000-000000000004','COT-2026-0031',null,'22222222-0000-0000-0000-000000000004',1,'pendiente','2026-06-01','2026-07-01',28000000,0,19,5320000,33320000,'Ampliación casa habitación'),
('55555555-0000-0000-0000-000000000005','COT-2026-0032',null,'22222222-0000-0000-0000-000000000005',1,'rechazada','2026-04-10','2026-05-10',95000000,0,19,18050000,113050000,'Licitación no adjudicada')
on conflict (id) do nothing;

insert into cotizacion_items (cotizacion_id, linea, descripcion, unidad, cantidad, precio_unitario, subtotal) values
('55555555-0000-0000-0000-000000000001',1,'Obra gruesa estructura hormigón armado','GL',1,520000000,520000000),
('55555555-0000-0000-0000-000000000001',2,'Terminaciones e instalaciones','GL',1,330000000,330000000),
('55555555-0000-0000-0000-000000000003',1,'Construcción local comercial 450 m2','m2',450,400000,180000000),
('55555555-0000-0000-0000-000000000004',1,'Ampliación 40 m2 segundo piso','m2',40,700000,28000000);

-- Órdenes de compra
insert into ordenes_compra (numero, tipo, proyecto_id, proveedor_id, cliente_id, cotizacion_id, estado, fecha_emision, total) values
('OC-2026-101','proveedor','44444444-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001',null,null,'aprobada','2026-02-01',120000000),
('OC-2026-102','proveedor','44444444-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000002',null,null,'en_proceso','2026-03-10',85000000),
('OC-2026-103','cliente','44444444-0000-0000-0000-000000000002',null,'22222222-0000-0000-0000-000000000002','55555555-0000-0000-0000-000000000002','aprobada','2026-03-01',474810000),
('OC-2026-104','proveedor','44444444-0000-0000-0000-000000000002','33333333-0000-0000-0000-000000000004',null,null,'pendiente','2026-05-15',45000000);

-- Facturas
insert into facturas (id, numero_folio, tipo, proyecto_id, cliente_id, proveedor_id, estado, fecha_emision, fecha_vencimiento, neto, iva, total) values
('66666666-0000-0000-0000-000000000001','F-8801','emitida','44444444-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001',null,'cobrada','2026-02-15','2026-03-17',200000000,38000000,238000000),
('66666666-0000-0000-0000-000000000002','F-8830','emitida','44444444-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001',null,'pendiente','2026-04-30','2026-05-30',200000000,38000000,238000000),
('66666666-0000-0000-0000-000000000003','F-8855','emitida','44444444-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002',null,'vencida','2026-03-20','2026-05-19',150000000,28500000,178500000),
('66666666-0000-0000-0000-000000000004','R-4521','recibida','44444444-0000-0000-0000-000000000001',null,'33333333-0000-0000-0000-000000000001','pendiente','2026-04-05','2026-05-05',100840336,19159664,120000000),
('66666666-0000-0000-0000-000000000005','R-4540','recibida','44444444-0000-0000-0000-000000000002',null,'33333333-0000-0000-0000-000000000002','pagada','2026-03-15','2026-03-15',71428571,13571429,85000000)
on conflict (id) do nothing;

-- Cobros
insert into cobros (factura_id, cliente_id, monto, fecha_programada, fecha_cobrado, estado, metodo_pago, referencia_pago) values
('66666666-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001',238000000,'2026-03-17','2026-03-15','cobrado','transferencia','TRX-99812'),
('66666666-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000001',238000000,'2026-05-30',null,'pendiente',null,null),
('66666666-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000002',178500000,'2026-05-19',null,'atrasada',null,null),
(null,'22222222-0000-0000-0000-000000000003',60000000,'2026-07-10',null,'pendiente',null,null);

-- Obras (3)
insert into obras (codigo, nombre, proyecto_id, cliente_id, tipo, estado, direccion, fecha_inicio_plan, fecha_fin_plan, presupuesto, costo_real, avance_pct, jefe_obra_id) values
('OBR-001','Mirador Las Condes - Torre A','44444444-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001','edificacion','en_proceso','Av. Apoquindo 5400, Las Condes','2026-01-20','2026-12-15',850000000,310000000,38,'11111111-0000-0000-0000-000000000002'),
('OBR-002','Mall Vista Norte - Ala Poniente','44444444-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000002','remodelacion','en_proceso','Av. Independencia 1200, Antofagasta','2026-03-05','2026-09-25',420000000,245000000,62,'11111111-0000-0000-0000-000000000004'),
('OBR-003','Local Retail Sur - Concepción','44444444-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000003','edificacion','pendiente','Barros Arana 800, Concepción','2026-07-05','2026-11-10',180000000,0,0,'11111111-0000-0000-0000-000000000002');
