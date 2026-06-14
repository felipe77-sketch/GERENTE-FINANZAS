export type Currency = "CLP" | "USD" | "EUR";

export interface Cliente {
  id: string;
  rut: string;
  razon_social: string;
  tipo: string;
  email: string;
  telefono: string;
  condicion_pago: string;
  estado: string;
  ejecutivo_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Proyecto {
  id: string;
  codigo: string;
  nombre: string;
  cliente_id: string;
  tipo: string;
  estado: string;
  fecha_inicio: string | null;
  fecha_fin_estimada: string | null;
  presupuesto_total: number;
  currency: Currency;
  responsable_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Cotizacion {
  id: string;
  numero: string;
  proyecto_id: string | null;
  cliente_id: string;
  version: number;
  estado: string;
  fecha_emision: string | null;
  fecha_validez: string | null;
  subtotal: number;
  descuento_pct: number;
  impuesto_pct: number;
  impuesto_monto: number;
  total: number;
  currency: Currency;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

export interface CotizacionItem {
  id: string;
  cotizacion_id: string;
  linea: number;
  descripcion: string;
  unidad: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface OrdenCompra {
  id: string;
  numero: string;
  tipo: "cliente" | "proveedor";
  proyecto_id: string | null;
  cotizacion_id: string | null;
  cliente_id: string | null;
  proveedor_id: string | null;
  estado: string;
  fecha_emision: string | null;
  total: number;
  currency: Currency;
  created_at: string;
}

export interface Factura {
  id: string;
  numero_folio: string;
  tipo: "emitida" | "recibida";
  proyecto_id: string | null;
  oc_id: string | null;
  cliente_id: string | null;
  proveedor_id: string | null;
  estado: string;
  fecha_emision: string | null;
  fecha_vencimiento: string | null;
  neto: number;
  iva: number;
  total: number;
  currency: Currency;
  created_at: string;
}

export interface Cobro {
  id: string;
  factura_id: string | null;
  cliente_id: string | null;
  monto: number;
  currency: Currency;
  fecha_programada: string | null;
  fecha_cobrado: string | null;
  estado: string;
  metodo_pago: string | null;
  referencia_pago: string | null;
  created_at: string;
}

export interface Obra {
  id: string;
  codigo: string;
  nombre: string;
  proyecto_id: string | null;
  cliente_id: string | null;
  tipo: string;
  estado: string;
  direccion: string;
  fecha_inicio_plan: string | null;
  fecha_fin_plan: string | null;
  presupuesto: number;
  costo_real: number;
  avance_pct: number;
  jefe_obra_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Personal {
  id: string;
  rut: string;
  nombre: string;
  apellido: string;
  email_corporativo: string;
  cargo: string;
  departamento: string;
  tipo_contrato: string;
  fecha_ingreso: string | null;
  estado: string;
  user_id: string | null;
  created_at: string;
}

export interface Proveedor {
  id: string;
  rut: string;
  razon_social: string;
  tipo: string;
  categoria: string;
  email: string;
  telefono: string;
  condicion_pago: string;
  estado: string;
  created_at: string;
}
