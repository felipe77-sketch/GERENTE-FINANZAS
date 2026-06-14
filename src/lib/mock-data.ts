import type {
  Cliente, Proyecto, Cotizacion, CotizacionItem, OrdenCompra,
  Factura, Cobro, Obra, Personal, Proveedor,
} from "./types";

const now = "2026-06-14T12:00:00Z";

export const mockPersonal: Personal[] = [
  { id: "p1", rut: "15.234.567-8", nombre: "Andrea", apellido: "Soto", email_corporativo: "andrea.soto@dupplo.cl", cargo: "Gerente Comercial", departamento: "Comercial", tipo_contrato: "indefinido", fecha_ingreso: "2021-03-01", estado: "activo", user_id: null, created_at: now },
  { id: "p2", rut: "16.876.543-2", nombre: "Cristóbal", apellido: "Vega", email_corporativo: "cristobal.vega@dupplo.cl", cargo: "Jefe de Obra", departamento: "Operaciones", tipo_contrato: "indefinido", fecha_ingreso: "2020-07-15", estado: "activo", user_id: null, created_at: now },
  { id: "p3", rut: "17.445.221-9", nombre: "María José", apellido: "Reyes", email_corporativo: "mj.reyes@dupplo.cl", cargo: "Ejecutiva de Ventas", departamento: "Comercial", tipo_contrato: "indefinido", fecha_ingreso: "2022-01-10", estado: "activo", user_id: null, created_at: now },
  { id: "p4", rut: "13.998.776-5", nombre: "Rodrigo", apellido: "Muñoz", email_corporativo: "rodrigo.munoz@dupplo.cl", cargo: "Jefe de Obra", departamento: "Operaciones", tipo_contrato: "plazo_fijo", fecha_ingreso: "2023-05-02", estado: "activo", user_id: null, created_at: now },
  { id: "p5", rut: "18.332.110-K", nombre: "Valentina", apellido: "Castro", email_corporativo: "valentina.castro@dupplo.cl", cargo: "Analista de Finanzas", departamento: "Finanzas", tipo_contrato: "indefinido", fecha_ingreso: "2021-11-20", estado: "activo", user_id: null, created_at: now },
  { id: "p6", rut: "12.556.889-1", nombre: "Felipe", apellido: "Inspector", email_corporativo: "felipe.inspector@dupplo.cl", cargo: "CEO", departamento: "Dirección", tipo_contrato: "indefinido", fecha_ingreso: "2018-01-01", estado: "activo", user_id: null, created_at: now },
  { id: "p7", rut: "19.221.443-7", nombre: "Tomás", apellido: "Fuentes", email_corporativo: "tomas.fuentes@dupplo.cl", cargo: "Prevencionista", departamento: "Operaciones", tipo_contrato: "plazo_fijo", fecha_ingreso: "2024-02-01", estado: "activo", user_id: null, created_at: now },
  { id: "p8", rut: "14.778.221-3", nombre: "Daniela", apellido: "Pino", email_corporativo: "daniela.pino@dupplo.cl", cargo: "Administrativa", departamento: "Administración", tipo_contrato: "indefinido", fecha_ingreso: "2020-09-12", estado: "inactivo", user_id: null, created_at: now },
];

export const mockClientes: Cliente[] = [
  { id: "c1", rut: "76.123.456-7", razon_social: "Inmobiliaria Los Andes SpA", tipo: "empresa", email: "contacto@losandes.cl", telefono: "+56 2 2345 6789", condicion_pago: "30 días", estado: "activo", ejecutivo_id: "p3", created_at: now, updated_at: now, deleted_at: null },
  { id: "c2", rut: "77.998.221-3", razon_social: "Constructora Vista Norte Ltda", tipo: "empresa", email: "compras@vistanorte.cl", telefono: "+56 2 2987 1122", condicion_pago: "60 días", estado: "activo", ejecutivo_id: "p1", created_at: now, updated_at: now, deleted_at: null },
  { id: "c3", rut: "78.445.667-9", razon_social: "Retail Sur S.A.", tipo: "empresa", email: "proyectos@retailsur.cl", telefono: "+56 41 222 3344", condicion_pago: "45 días", estado: "activo", ejecutivo_id: "p3", created_at: now, updated_at: now, deleted_at: null },
  { id: "c4", rut: "9.887.554-2", razon_social: "Juan Pérez Hernández", tipo: "persona", email: "jperez@gmail.com", telefono: "+56 9 8877 6655", condicion_pago: "contado", estado: "activo", ejecutivo_id: "p1", created_at: now, updated_at: now, deleted_at: null },
  { id: "c5", rut: "76.554.332-1", razon_social: "Municipalidad de Quilpué", tipo: "publico", email: "obras@quilpue.cl", telefono: "+56 32 234 5566", condicion_pago: "90 días", estado: "inactivo", ejecutivo_id: "p3", created_at: now, updated_at: now, deleted_at: null },
];

export const mockProveedores: Proveedor[] = [
  { id: "pr1", rut: "76.222.111-0", razon_social: "Aceros del Pacífico Ltda", tipo: "empresa", categoria: "Materiales", email: "ventas@aceros.cl", telefono: "+56 2 2444 5566", condicion_pago: "30 días", estado: "activo", created_at: now },
  { id: "pr2", rut: "77.333.222-K", razon_social: "Hormigones Premix S.A.", tipo: "empresa", categoria: "Materiales", email: "pedidos@premix.cl", telefono: "+56 2 2555 6677", condicion_pago: "contado", estado: "activo", created_at: now },
  { id: "pr3", rut: "78.444.333-5", razon_social: "Arriendos Maquinaria Norte", tipo: "empresa", categoria: "Maquinaria", email: "arriendo@maqnorte.cl", telefono: "+56 55 233 4455", condicion_pago: "30 días", estado: "activo", created_at: now },
  { id: "pr4", rut: "79.555.444-2", razon_social: "Eléctrica Andina SpA", tipo: "empresa", categoria: "Subcontrato", email: "contacto@electandina.cl", telefono: "+56 2 2666 7788", condicion_pago: "45 días", estado: "activo", created_at: now },
];

export const mockProyectos: Proyecto[] = [
  { id: "py1", codigo: "PRY-2026-001", nombre: "Edificio Mirador Las Condes", cliente_id: "c1", tipo: "construccion", estado: "en_proceso", fecha_inicio: "2026-01-15", fecha_fin_estimada: "2026-12-20", presupuesto_total: 850000000, currency: "CLP", responsable_id: "p2", created_at: now, updated_at: now },
  { id: "py2", codigo: "PRY-2026-002", nombre: "Remodelación Mall Vista Norte", cliente_id: "c2", tipo: "remodelacion", estado: "en_proceso", fecha_inicio: "2026-03-01", fecha_fin_estimada: "2026-09-30", presupuesto_total: 420000000, currency: "CLP", responsable_id: "p4", created_at: now, updated_at: now },
  { id: "py3", codigo: "PRY-2026-003", nombre: "Local Comercial Retail Sur", cliente_id: "c3", tipo: "construccion", estado: "pendiente", fecha_inicio: "2026-07-01", fecha_fin_estimada: "2026-11-15", presupuesto_total: 180000000, currency: "CLP", responsable_id: "p2", created_at: now, updated_at: now },
];

export const mockCotizaciones: Cotizacion[] = [
  { id: "q1", numero: "COT-2026-0012", proyecto_id: "py1", cliente_id: "c1", version: 2, estado: "aprobada", fecha_emision: "2026-01-05", fecha_validez: "2026-02-05", subtotal: 850000000, descuento_pct: 0, impuesto_pct: 19, impuesto_monto: 161500000, total: 1011500000, currency: "CLP", notas: "Incluye obra gruesa y terminaciones", created_at: now, updated_at: now },
  { id: "q2", numero: "COT-2026-0021", proyecto_id: "py2", cliente_id: "c2", version: 1, estado: "aprobada", fecha_emision: "2026-02-20", fecha_validez: "2026-03-20", subtotal: 420000000, descuento_pct: 5, impuesto_pct: 19, impuesto_monto: 75810000, total: 474810000, currency: "CLP", notas: null, created_at: now, updated_at: now },
  { id: "q3", numero: "COT-2026-0030", proyecto_id: "py3", cliente_id: "c3", version: 1, estado: "en_revision", fecha_emision: "2026-05-28", fecha_validez: "2026-06-28", subtotal: 180000000, descuento_pct: 0, impuesto_pct: 19, impuesto_monto: 34200000, total: 214200000, currency: "CLP", notas: "Pendiente aprobación de planos", created_at: now, updated_at: now },
  { id: "q4", numero: "COT-2026-0031", proyecto_id: null, cliente_id: "c4", version: 1, estado: "pendiente", fecha_emision: "2026-06-01", fecha_validez: "2026-07-01", subtotal: 28000000, descuento_pct: 0, impuesto_pct: 19, impuesto_monto: 5320000, total: 33320000, currency: "CLP", notas: "Ampliación casa habitación", created_at: now, updated_at: now },
  { id: "q5", numero: "COT-2026-0032", proyecto_id: null, cliente_id: "c5", version: 1, estado: "rechazada", fecha_emision: "2026-04-10", fecha_validez: "2026-05-10", subtotal: 95000000, descuento_pct: 0, impuesto_pct: 19, impuesto_monto: 18050000, total: 113050000, currency: "CLP", notas: "Licitación no adjudicada", created_at: now, updated_at: now },
];

export const mockCotizacionItems: CotizacionItem[] = [
  { id: "qi1", cotizacion_id: "q1", linea: 1, descripcion: "Obra gruesa estructura hormigón armado", unidad: "GL", cantidad: 1, precio_unitario: 520000000, subtotal: 520000000 },
  { id: "qi2", cotizacion_id: "q1", linea: 2, descripcion: "Terminaciones e instalaciones", unidad: "GL", cantidad: 1, precio_unitario: 330000000, subtotal: 330000000 },
  { id: "qi3", cotizacion_id: "q3", linea: 1, descripcion: "Construcción local comercial 450 m2", unidad: "m2", cantidad: 450, precio_unitario: 400000, subtotal: 180000000 },
  { id: "qi4", cotizacion_id: "q4", linea: 1, descripcion: "Ampliación 40 m2 segundo piso", unidad: "m2", cantidad: 40, precio_unitario: 700000, subtotal: 28000000 },
];

export const mockOrdenesCompra: OrdenCompra[] = [
  { id: "oc1", numero: "OC-2026-101", tipo: "proveedor", proyecto_id: "py1", cotizacion_id: null, cliente_id: null, proveedor_id: "pr1", estado: "aprobada", fecha_emision: "2026-02-01", total: 120000000, currency: "CLP", created_at: now },
  { id: "oc2", numero: "OC-2026-102", tipo: "proveedor", proyecto_id: "py1", cotizacion_id: null, cliente_id: null, proveedor_id: "pr2", estado: "en_proceso", fecha_emision: "2026-03-10", total: 85000000, currency: "CLP", created_at: now },
  { id: "oc3", numero: "OC-2026-103", tipo: "cliente", proyecto_id: "py2", cotizacion_id: "q2", cliente_id: "c2", proveedor_id: null, estado: "aprobada", fecha_emision: "2026-03-01", total: 474810000, currency: "CLP", created_at: now },
  { id: "oc4", numero: "OC-2026-104", tipo: "proveedor", proyecto_id: "py2", cotizacion_id: null, cliente_id: null, proveedor_id: "pr4", estado: "pendiente", fecha_emision: "2026-05-15", total: 45000000, currency: "CLP", created_at: now },
];

export const mockFacturas: Factura[] = [
  { id: "f1", numero_folio: "F-8801", tipo: "emitida", proyecto_id: "py1", oc_id: null, cliente_id: "c1", proveedor_id: null, estado: "cobrada", fecha_emision: "2026-02-15", fecha_vencimiento: "2026-03-17", neto: 200000000, iva: 38000000, total: 238000000, currency: "CLP", created_at: now },
  { id: "f2", numero_folio: "F-8830", tipo: "emitida", proyecto_id: "py1", oc_id: null, cliente_id: "c1", proveedor_id: null, estado: "pendiente", fecha_emision: "2026-04-30", fecha_vencimiento: "2026-05-30", neto: 200000000, iva: 38000000, total: 238000000, currency: "CLP", created_at: now },
  { id: "f3", numero_folio: "F-8855", tipo: "emitida", proyecto_id: "py2", oc_id: "oc3", cliente_id: "c2", proveedor_id: null, estado: "vencida", fecha_emision: "2026-03-20", fecha_vencimiento: "2026-05-19", neto: 150000000, iva: 28500000, total: 178500000, currency: "CLP", created_at: now },
  { id: "f4", numero_folio: "R-4521", tipo: "recibida", proyecto_id: "py1", oc_id: "oc1", cliente_id: null, proveedor_id: "pr1", estado: "pendiente", fecha_emision: "2026-04-05", fecha_vencimiento: "2026-05-05", neto: 100840336, iva: 19159664, total: 120000000, currency: "CLP", created_at: now },
  { id: "f5", numero_folio: "R-4540", tipo: "recibida", proyecto_id: "py2", oc_id: null, cliente_id: null, proveedor_id: "pr2", estado: "pagada", fecha_emision: "2026-03-15", fecha_vencimiento: "2026-03-15", neto: 71428571, iva: 13571429, total: 85000000, currency: "CLP", created_at: now },
];

export const mockCobros: Cobro[] = [
  { id: "cb1", factura_id: "f1", cliente_id: "c1", monto: 238000000, currency: "CLP", fecha_programada: "2026-03-17", fecha_cobrado: "2026-03-15", estado: "cobrado", metodo_pago: "transferencia", referencia_pago: "TRX-99812", created_at: now },
  { id: "cb2", factura_id: "f2", cliente_id: "c1", monto: 238000000, currency: "CLP", fecha_programada: "2026-05-30", fecha_cobrado: null, estado: "pendiente", metodo_pago: null, referencia_pago: null, created_at: now },
  { id: "cb3", factura_id: "f3", cliente_id: "c2", monto: 178500000, currency: "CLP", fecha_programada: "2026-05-19", fecha_cobrado: null, estado: "atrasada", metodo_pago: null, referencia_pago: null, created_at: now },
  { id: "cb4", factura_id: null, cliente_id: "c3", monto: 60000000, currency: "CLP", fecha_programada: "2026-07-10", fecha_cobrado: null, estado: "pendiente", metodo_pago: null, referencia_pago: null, created_at: now },
];

export const mockObras: Obra[] = [
  { id: "ob1", codigo: "OBR-001", nombre: "Mirador Las Condes - Torre A", proyecto_id: "py1", cliente_id: "c1", tipo: "edificacion", estado: "en_proceso", direccion: "Av. Apoquindo 5400, Las Condes", fecha_inicio_plan: "2026-01-20", fecha_fin_plan: "2026-12-15", presupuesto: 850000000, costo_real: 310000000, avance_pct: 38, jefe_obra_id: "p2", created_at: now, updated_at: now },
  { id: "ob2", codigo: "OBR-002", nombre: "Mall Vista Norte - Ala Poniente", proyecto_id: "py2", cliente_id: "c2", tipo: "remodelacion", estado: "en_proceso", direccion: "Av. Independencia 1200, Antofagasta", fecha_inicio_plan: "2026-03-05", fecha_fin_plan: "2026-09-25", presupuesto: 420000000, costo_real: 245000000, avance_pct: 62, jefe_obra_id: "p4", created_at: now, updated_at: now },
  { id: "ob3", codigo: "OBR-003", nombre: "Local Retail Sur - Concepción", proyecto_id: "py3", cliente_id: "c3", tipo: "edificacion", estado: "pendiente", direccion: "Barros Arana 800, Concepción", fecha_inicio_plan: "2026-07-05", fecha_fin_plan: "2026-11-10", presupuesto: 180000000, costo_real: 0, avance_pct: 0, jefe_obra_id: "p2", created_at: now, updated_at: now },
];
