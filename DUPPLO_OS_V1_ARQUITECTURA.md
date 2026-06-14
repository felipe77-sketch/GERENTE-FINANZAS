# DUPPLO OS V1 — ARQUITECTURA DE DATOS CORPORATIVA

> Versión: 1.0 | Fecha: 2026-06-14 | Estado: DISEÑO

---

## ÍNDICE

1. [Principios de Diseño](#1-principios-de-diseño)
2. [Modelo de Base de Datos](#2-modelo-de-base-de-datos)
3. [Relaciones entre Tablas](#3-relaciones-entre-tablas)
4. [Campos Obligatorios por Entidad](#4-campos-obligatorios-por-entidad)
5. [Dashboard CEO](#5-dashboard-ceo)
6. [Dashboard Comercial](#6-dashboard-comercial)
7. [Dashboard Finanzas](#7-dashboard-finanzas)
8. [Dashboard Operaciones](#8-dashboard-operaciones)

---

## 1. PRINCIPIOS DE DISEÑO

| Principio | Aplicación |
|-----------|-----------|
| **Single Source of Truth** | Cada entidad existe una sola vez; todo se referencia, nunca se duplica |
| **Trazabilidad completa** | Cada registro tiene `created_at`, `updated_at`, `created_by` |
| **Soft delete** | `deleted_at` nullable — nada se borra físicamente |
| **Multi-moneda** | Montos siempre con campo `currency` (CLP / USD / EUR) |
| **Auditoría** | Tabla `audit_log` registra toda mutación crítica |
| **Escalabilidad** | IDs en UUID v4; índices en claves foráneas y campos de búsqueda frecuente |

---

## 2. MODELO DE BASE DE DATOS

### 2.1 ESQUEMA GLOBAL

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   CLIENTES  │────▶│  PROYECTOS  │────▶│  COTIZACIONES│
└─────────────┘     └─────────────┘     └──────────────┘
                           │                     │
                           ▼                     ▼
                    ┌─────────────┐       ┌──────────┐
                    │    OBRAS    │       │    OC    │
                    └─────────────┘       └──────────┘
                           │                     │
                           ▼                     ▼
                    ┌─────────────┐     ┌──────────────┐
                    │  PERSONAL   │     │   FACTURAS   │
                    └─────────────┘     └──────────────┘
                                               │
                    ┌─────────────┐            ▼
                    │ PROVEEDORES │     ┌──────────────┐
                    └─────────────┘     │    COBROS    │
                                        └──────────────┘
```

---

### 2.2 TABLA: `clientes`

```sql
clientes
├── id                  UUID         PK
├── rut                 VARCHAR(12)  UNIQUE NOT NULL
├── razon_social        VARCHAR(200) NOT NULL
├── nombre_fantasia     VARCHAR(200)
├── tipo                ENUM('empresa','persona_natural')  NOT NULL
├── rubro               VARCHAR(100)
├── direccion           VARCHAR(300)
├── comuna              VARCHAR(100)
├── ciudad              VARCHAR(100)
├── pais                VARCHAR(60)  DEFAULT 'Chile'
├── telefono            VARCHAR(20)
├── email               VARCHAR(150)
├── sitio_web           VARCHAR(200)
├── condicion_pago      ENUM('contado','30_dias','60_dias','90_dias')  DEFAULT 'contado'
├── limite_credito      DECIMAL(15,2)
├── currency            CHAR(3)      DEFAULT 'CLP'
├── estado              ENUM('activo','inactivo','bloqueado')  DEFAULT 'activo'
├── segmento            ENUM('A','B','C')
├── ejecutivo_id        UUID         FK → personal.id
├── notas               TEXT
├── created_by          UUID         FK → users.id
├── created_at          TIMESTAMP    NOT NULL
├── updated_at          TIMESTAMP    NOT NULL
└── deleted_at          TIMESTAMP
```

**Tabla relacionada: `contactos_cliente`**
```sql
contactos_cliente
├── id                  UUID         PK
├── cliente_id          UUID         FK → clientes.id  NOT NULL
├── nombre              VARCHAR(150) NOT NULL
├── cargo               VARCHAR(100)
├── email               VARCHAR(150)
├── telefono            VARCHAR(20)
├── es_principal        BOOLEAN      DEFAULT FALSE
└── created_at          TIMESTAMP
```

---

### 2.3 TABLA: `proyectos`

```sql
proyectos
├── id                  UUID         PK
├── codigo              VARCHAR(20)  UNIQUE NOT NULL  -- ej: PROJ-2026-001
├── nombre              VARCHAR(250) NOT NULL
├── descripcion         TEXT
├── cliente_id          UUID         FK → clientes.id  NOT NULL
├── tipo                ENUM('llave_en_mano','administracion','consultoria','suministro')
├── estado              ENUM('prospecto','activo','pausado','cerrado','cancelado')  DEFAULT 'prospecto'
├── fecha_inicio        DATE
├── fecha_fin_estimada  DATE
├── fecha_fin_real      DATE
├── presupuesto_total   DECIMAL(15,2)
├── currency            CHAR(3)      DEFAULT 'CLP'
├── margen_objetivo     DECIMAL(5,2)  -- porcentaje
├── responsable_id      UUID         FK → personal.id
├── created_by          UUID         FK → users.id
├── created_at          TIMESTAMP    NOT NULL
├── updated_at          TIMESTAMP    NOT NULL
└── deleted_at          TIMESTAMP
```

---

### 2.4 TABLA: `cotizaciones`

```sql
cotizaciones
├── id                  UUID         PK
├── numero              VARCHAR(20)  UNIQUE NOT NULL  -- ej: COT-2026-0042
├── proyecto_id         UUID         FK → proyectos.id  NOT NULL
├── cliente_id          UUID         FK → clientes.id   NOT NULL
├── version             INTEGER      DEFAULT 1
├── estado              ENUM('borrador','enviada','en_revision','aprobada','rechazada','vencida')  DEFAULT 'borrador'
├── fecha_emision       DATE         NOT NULL
├── fecha_validez       DATE         NOT NULL
├── subtotal            DECIMAL(15,2) NOT NULL
├── descuento_pct       DECIMAL(5,2)  DEFAULT 0
├── descuento_monto     DECIMAL(15,2) DEFAULT 0
├── impuesto_pct        DECIMAL(5,2)  DEFAULT 19  -- IVA Chile
├── impuesto_monto      DECIMAL(15,2)
├── total               DECIMAL(15,2) NOT NULL
├── currency            CHAR(3)       DEFAULT 'CLP'
├── condicion_pago      VARCHAR(200)
├── tiempo_entrega      VARCHAR(100)
├── validez_dias        INTEGER       DEFAULT 30
├── notas               TEXT
├── archivo_url         VARCHAR(500)  -- PDF generado
├── aprobado_por        UUID          FK → contactos_cliente.id
├── aprobado_en         TIMESTAMP
├── creado_por          UUID          FK → users.id
├── created_at          TIMESTAMP     NOT NULL
├── updated_at          TIMESTAMP     NOT NULL
└── deleted_at          TIMESTAMP
```

**Tabla relacionada: `cotizacion_items`**
```sql
cotizacion_items
├── id                  UUID         PK
├── cotizacion_id       UUID         FK → cotizaciones.id  NOT NULL
├── linea               INTEGER      NOT NULL  -- orden
├── descripcion         VARCHAR(500) NOT NULL
├── unidad              VARCHAR(30)
├── cantidad            DECIMAL(12,4) NOT NULL
├── precio_unitario     DECIMAL(15,2) NOT NULL
├── descuento_pct       DECIMAL(5,2)  DEFAULT 0
├── subtotal            DECIMAL(15,2) NOT NULL
├── proveedor_id        UUID          FK → proveedores.id  -- origen del ítem
└── notas               VARCHAR(500)
```

---

### 2.5 TABLA: `ordenes_compra` (OC)

```sql
ordenes_compra
├── id                  UUID         PK
├── numero              VARCHAR(20)  UNIQUE NOT NULL  -- ej: OC-2026-0018
├── tipo                ENUM('cliente','proveedor')  NOT NULL
├── proyecto_id         UUID         FK → proyectos.id
├── cotizacion_id       UUID         FK → cotizaciones.id  -- OC generada desde cotización
├── -- Si tipo = 'cliente':
├── cliente_id          UUID         FK → clientes.id
├── -- Si tipo = 'proveedor':
├── proveedor_id        UUID         FK → proveedores.id
├── estado              ENUM('borrador','emitida','confirmada','en_proceso','recibida','cerrada','anulada')  DEFAULT 'borrador'
├── fecha_emision       DATE         NOT NULL
├── fecha_entrega_req   DATE
├── fecha_entrega_real  DATE
├── subtotal            DECIMAL(15,2) NOT NULL
├── impuesto_monto      DECIMAL(15,2)
├── total               DECIMAL(15,2) NOT NULL
├── currency            CHAR(3)       DEFAULT 'CLP'
├── condicion_pago      VARCHAR(200)
├── lugar_entrega       VARCHAR(300)
├── notas               TEXT
├── archivo_url         VARCHAR(500)
├── created_by          UUID          FK → users.id
├── created_at          TIMESTAMP     NOT NULL
├── updated_at          TIMESTAMP     NOT NULL
└── deleted_at          TIMESTAMP
```

**Tabla relacionada: `oc_items`**
```sql
oc_items
├── id                  UUID         PK
├── oc_id               UUID         FK → ordenes_compra.id  NOT NULL
├── linea               INTEGER      NOT NULL
├── descripcion         VARCHAR(500) NOT NULL
├── unidad              VARCHAR(30)
├── cantidad            DECIMAL(12,4) NOT NULL
├── precio_unitario     DECIMAL(15,2) NOT NULL
├── subtotal            DECIMAL(15,2) NOT NULL
├── cantidad_recibida   DECIMAL(12,4) DEFAULT 0
└── notas               VARCHAR(500)
```

---

### 2.6 TABLA: `facturas`

```sql
facturas
├── id                  UUID         PK
├── numero_folio        VARCHAR(20)  NOT NULL  -- folio SII / proveedor
├── tipo                ENUM('emitida','recibida')  NOT NULL
├── tipo_documento      ENUM('factura','boleta','nota_credito','nota_debito','liquidacion')  DEFAULT 'factura'
├── proyecto_id         UUID         FK → proyectos.id
├── oc_id               UUID         FK → ordenes_compra.id
├── -- Si emitida:
├── cliente_id          UUID         FK → clientes.id
├── -- Si recibida:
├── proveedor_id        UUID         FK → proveedores.id
├── estado              ENUM('pendiente','pagada','vencida','anulada','en_disputa')  DEFAULT 'pendiente'
├── fecha_emision       DATE         NOT NULL
├── fecha_vencimiento   DATE         NOT NULL
├── neto                DECIMAL(15,2) NOT NULL
├── iva                 DECIMAL(15,2)
├── total               DECIMAL(15,2) NOT NULL
├── currency            CHAR(3)       DEFAULT 'CLP'
├── archivo_url         VARCHAR(500)
├── notas               TEXT
├── created_by          UUID          FK → users.id
├── created_at          TIMESTAMP     NOT NULL
├── updated_at          TIMESTAMP     NOT NULL
└── deleted_at          TIMESTAMP
```

---

### 2.7 TABLA: `cobros`

```sql
cobros
├── id                  UUID         PK
├── factura_id          UUID         FK → facturas.id  NOT NULL
├── proyecto_id         UUID         FK → proyectos.id
├── cliente_id          UUID         FK → clientes.id  NOT NULL
├── monto               DECIMAL(15,2) NOT NULL
├── currency            CHAR(3)       DEFAULT 'CLP'
├── fecha_programada    DATE          NOT NULL
├── fecha_cobrado       DATE
├── estado              ENUM('pendiente','parcial','cobrado','incobrable')  DEFAULT 'pendiente'
├── metodo_pago         ENUM('transferencia','cheque','efectivo','tarjeta','otro')
├── referencia_pago     VARCHAR(100)  -- número transferencia, cheque, etc.
├── cuenta_bancaria_id  UUID          FK → cuentas_bancarias.id
├── gestionado_por      UUID          FK → personal.id
├── notas               TEXT
├── created_by          UUID          FK → users.id
├── created_at          TIMESTAMP     NOT NULL
└── updated_at          TIMESTAMP     NOT NULL
```

**Tabla relacionada: `cuentas_bancarias`**
```sql
cuentas_bancarias
├── id                  UUID         PK
├── banco               VARCHAR(100) NOT NULL
├── tipo_cuenta         ENUM('corriente','vista','ahorro')
├── numero_cuenta       VARCHAR(50)  NOT NULL
├── rut_titular         VARCHAR(12)
├── nombre_titular      VARCHAR(200)
├── email_titular       VARCHAR(150)
├── es_propia           BOOLEAN      DEFAULT TRUE
├── proveedor_id        UUID         FK → proveedores.id  -- si es cuenta de proveedor
└── activa              BOOLEAN      DEFAULT TRUE
```

---

### 2.8 TABLA: `obras`

```sql
obras
├── id                  UUID         PK
├── codigo              VARCHAR(20)  UNIQUE NOT NULL  -- ej: OBR-2026-005
├── nombre              VARCHAR(250) NOT NULL
├── proyecto_id         UUID         FK → proyectos.id  NOT NULL
├── cliente_id          UUID         FK → clientes.id
├── tipo                ENUM('construccion','instalacion','mantencion','retrofit','otro')
├── estado              ENUM('planificada','en_ejecucion','pausada','completada','cerrada','cancelada')  DEFAULT 'planificada'
├── direccion           VARCHAR(300)
├── comuna              VARCHAR(100)
├── ciudad              VARCHAR(100)
├── fecha_inicio_plan   DATE
├── fecha_fin_plan      DATE
├── fecha_inicio_real   DATE
├── fecha_fin_real      DATE
├── presupuesto         DECIMAL(15,2)
├── costo_real          DECIMAL(15,2)  DEFAULT 0
├── currency            CHAR(3)        DEFAULT 'CLP'
├── avance_pct          DECIMAL(5,2)   DEFAULT 0
├── jefe_obra_id        UUID           FK → personal.id
├── notas               TEXT
├── created_by          UUID           FK → users.id
├── created_at          TIMESTAMP      NOT NULL
├── updated_at          TIMESTAMP      NOT NULL
└── deleted_at          TIMESTAMP
```

**Tabla relacionada: `obra_hitos`**
```sql
obra_hitos
├── id                  UUID         PK
├── obra_id             UUID         FK → obras.id  NOT NULL
├── nombre              VARCHAR(200) NOT NULL
├── descripcion         TEXT
├── fecha_plan          DATE
├── fecha_real          DATE
├── estado              ENUM('pendiente','en_proceso','completado','atrasado')  DEFAULT 'pendiente'
└── pct_avance_global   DECIMAL(5,2)  -- cuánto pesa este hito en el total
```

**Tabla relacionada: `obra_gastos`**
```sql
obra_gastos
├── id                  UUID         PK
├── obra_id             UUID         FK → obras.id       NOT NULL
├── factura_id          UUID         FK → facturas.id    -- si viene de factura
├── proveedor_id        UUID         FK → proveedores.id
├── categoria           ENUM('materiales','subcontrato','equipos','mano_obra','transporte','otro')
├── descripcion         VARCHAR(300) NOT NULL
├── monto               DECIMAL(15,2) NOT NULL
├── currency            CHAR(3)       DEFAULT 'CLP'
├── fecha               DATE          NOT NULL
└── created_by          UUID          FK → users.id
```

---

### 2.9 TABLA: `personal`

```sql
personal
├── id                  UUID         PK
├── rut                 VARCHAR(12)  UNIQUE NOT NULL
├── nombre              VARCHAR(100) NOT NULL
├── apellido            VARCHAR(100) NOT NULL
├── email_corporativo   VARCHAR(150) UNIQUE
├── email_personal      VARCHAR(150)
├── telefono            VARCHAR(20)
├── cargo               VARCHAR(100) NOT NULL
├── departamento        ENUM('comercial','operaciones','finanzas','administracion','gerencia','tecnico')
├── tipo_contrato       ENUM('planta','plazo_fijo','honorarios','subcontrato')
├── fecha_ingreso       DATE         NOT NULL
├── fecha_egreso        DATE
├── sueldo_base         DECIMAL(12,2)
├── currency            CHAR(3)      DEFAULT 'CLP'
├── estado              ENUM('activo','vacaciones','licencia','inactivo')  DEFAULT 'activo'
├── user_id             UUID         FK → users.id  UNIQUE  -- acceso al sistema
├── jefe_id             UUID         FK → personal.id  -- jerarquía
├── created_by          UUID         FK → users.id
├── created_at          TIMESTAMP    NOT NULL
├── updated_at          TIMESTAMP    NOT NULL
└── deleted_at          TIMESTAMP
```

**Tabla relacionada: `personal_obra`** (asignación a obras)
```sql
personal_obra
├── id                  UUID         PK
├── personal_id         UUID         FK → personal.id  NOT NULL
├── obra_id             UUID         FK → obras.id     NOT NULL
├── rol                 VARCHAR(100)
├── fecha_desde         DATE         NOT NULL
├── fecha_hasta         DATE
└── horas_estimadas     DECIMAL(8,2)
```

---

### 2.10 TABLA: `proveedores`

```sql
proveedores
├── id                  UUID         PK
├── rut                 VARCHAR(12)  UNIQUE NOT NULL
├── razon_social        VARCHAR(200) NOT NULL
├── nombre_fantasia     VARCHAR(200)
├── tipo                ENUM('empresa','persona_natural')  NOT NULL
├── rubro               VARCHAR(100)
├── categoria           ENUM('materiales','servicios','subcontrato','equipos','tecnologia','otro')
├── direccion           VARCHAR(300)
├── comuna              VARCHAR(100)
├── ciudad              VARCHAR(100)
├── pais                VARCHAR(60)  DEFAULT 'Chile'
├── telefono            VARCHAR(20)
├── email               VARCHAR(150)
├── condicion_pago      ENUM('contado','30_dias','60_dias','90_dias')
├── calificacion        INTEGER      CHECK (calificacion BETWEEN 1 AND 5)
├── estado              ENUM('activo','inactivo','bloqueado','en_evaluacion')  DEFAULT 'activo'
├── notas               TEXT
├── created_by          UUID         FK → users.id
├── created_at          TIMESTAMP    NOT NULL
├── updated_at          TIMESTAMP    NOT NULL
└── deleted_at          TIMESTAMP
```

---

### 2.11 TABLAS DE SISTEMA

**`users`** — Accesos al sistema
```sql
users
├── id                  UUID         PK
├── email               VARCHAR(150) UNIQUE NOT NULL
├── password_hash       VARCHAR(255) NOT NULL
├── rol                 ENUM('superadmin','gerente','comercial','finanzas','operaciones','lectura')
├── activo              BOOLEAN      DEFAULT TRUE
├── ultimo_login        TIMESTAMP
├── created_at          TIMESTAMP
└── updated_at          TIMESTAMP
```

**`audit_log`** — Trazabilidad de cambios
```sql
audit_log
├── id                  UUID         PK
├── tabla               VARCHAR(100) NOT NULL
├── registro_id         UUID         NOT NULL
├── accion              ENUM('INSERT','UPDATE','DELETE')  NOT NULL
├── datos_anterior      JSONB
├── datos_nuevo         JSONB
├── user_id             UUID         FK → users.id
└── created_at          TIMESTAMP    NOT NULL
```

---

## 3. RELACIONES ENTRE TABLAS

```
CLIENTES ──────────────────────────────────────────────────┐
    │                                                       │
    ├──(1:N)──▶ PROYECTOS                                  │
    │               │                                       │
    │               ├──(1:N)──▶ COTIZACIONES               │
    │               │               │                       │
    │               │               └──(1:1)──▶ OC_CLIENTE │
    │               │                               │       │
    │               ├──(1:N)──▶ OBRAS               │       │
    │               │               │               │       │
    │               │               └──(N:M)──▶ PERSONAL    │
    │               │                                       │
    │               └──(Referencia)──▶ PERSONAL             │
    │                                                       │
    └──(1:N)──▶ FACTURAS_EMITIDAS                          │
                    │                                       │
                    └──(1:N)──▶ COBROS ◀────────────────────┘

PROVEEDORES ──────────────────────────────────────────────┐
    │                                                      │
    ├──(1:N)──▶ OC_PROVEEDOR                              │
    │               │                                      │
    │               └──(1:N)──▶ FACTURAS_RECIBIDAS        │
    │                               │                      │
    └──(1:N)──▶ OBRA_GASTOS ◀──────┘                      │
                                                           │
PERSONAL ──────────────────────────────────────────────────┘
    │
    ├── Ejecutivo comercial en CLIENTES
    ├── Responsable en PROYECTOS
    └── Jefe de obra en OBRAS
```

### Cardinalidades clave

| Relación | Tipo | Nota |
|----------|------|------|
| Cliente → Proyectos | 1:N | Un cliente puede tener múltiples proyectos |
| Proyecto → Cotizaciones | 1:N | Varias versiones / revisiones |
| Cotización → OC Cliente | 1:1 | Una OC por cotización aprobada |
| OC Cliente → Factura Emitida | 1:N | Facturación parcial permitida |
| Factura Emitida → Cobros | 1:N | Cobro en cuotas permitido |
| Proyecto → Obras | 1:N | Un proyecto puede tener varias obras |
| Obra → Gastos | 1:N | Control de costos por obra |
| Proveedor → OC Proveedor | 1:N | Múltiples compras al mismo proveedor |
| OC Proveedor → Factura Recibida | 1:N | Recepciones parciales |
| Personal → Obras | N:M | Vía tabla `personal_obra` |

---

## 4. CAMPOS OBLIGATORIOS POR ENTIDAD

| Entidad | Campos Mínimos Obligatorios |
|---------|----------------------------|
| **Clientes** | `rut`, `razon_social`, `tipo`, `estado` |
| **Proyectos** | `codigo`, `nombre`, `cliente_id`, `estado` |
| **Cotizaciones** | `numero`, `proyecto_id`, `cliente_id`, `fecha_emision`, `fecha_validez`, `total` |
| **OC** | `numero`, `tipo`, `estado`, `fecha_emision`, `total` |
| **Facturas** | `numero_folio`, `tipo`, `tipo_documento`, `fecha_emision`, `fecha_vencimiento`, `neto`, `total` |
| **Cobros** | `factura_id`, `cliente_id`, `monto`, `fecha_programada`, `estado` |
| **Obras** | `codigo`, `nombre`, `proyecto_id`, `estado` |
| **Personal** | `rut`, `nombre`, `apellido`, `cargo`, `fecha_ingreso`, `estado` |
| **Proveedores** | `rut`, `razon_social`, `tipo`, `estado` |

---

## 5. DASHBOARD CEO

> Vista ejecutiva de alto nivel. Período configurable: semana / mes / trimestre / año.

### KPIs Primarios (tarjetas grandes)

| Métrica | Fórmula | Alerta |
|---------|---------|--------|
| **Revenue YTD** | Σ cobros.monto WHERE fecha_cobrado IN año actual | vs meta anual |
| **Pipeline Total** | Σ cotizaciones.total WHERE estado IN ('enviada','en_revision') | vs mes anterior |
| **Margen Bruto Proyectos** | (Revenue − costos_obras) / Revenue × 100 | < 25% = rojo |
| **DSO (Días de cobro)** | Promedio días entre factura emitida y cobro | > 60 = rojo |
| **Proyectos Activos** | COUNT proyectos WHERE estado = 'activo' | — |

### Gráficos

```
┌─────────────────────────────────┐  ┌─────────────────────────────┐
│  REVENUE vs META (barras mes)   │  │  MARGEN POR PROYECTO (radar)│
│  ██████░░ 73% de meta           │  │                             │
└─────────────────────────────────┘  └─────────────────────────────┘

┌─────────────────────────────────┐  ┌─────────────────────────────┐
│  PIPELINE POR ETAPA (funnel)    │  │  CUENTAS POR COBRAR (aging) │
│  Prospecto → Cotizado → Cerrado │  │  0-30d / 31-60d / 61-90d   │
└─────────────────────────────────┘  └─────────────────────────────┘
```

### Tabla de alertas ejecutivas
- Obras con avance < 30% y fecha fin en < 30 días
- Facturas vencidas > 90 días
- Proyectos sin factura en > 60 días desde OC
- Cotizaciones enviadas sin respuesta en > 15 días

---

## 6. DASHBOARD COMERCIAL

> Visibilidad del pipeline, clientes y rendimiento del equipo.

### KPIs Primarios

| Métrica | Descripción |
|---------|-------------|
| **Pipeline Value** | Valor total de cotizaciones activas |
| **Tasa de Cierre** | Cotizaciones aprobadas / total enviadas × 100 |
| **Ticket Promedio** | Promedio valor cotizaciones cerradas |
| **Tiempo Promedio de Cierre** | Días promedio: cotización enviada → OC firmada |
| **Nuevos Clientes (mes)** | Clientes creados en el período |

### Vistas clave

**Pipeline por ejecutivo**
```
Ejecutivo     | Prospectos | Cotizados | Negociando | Cerrado |  Total
─────────────────────────────────────────────────────────────────────
Felipe M.     |     3      |     5     |     2      |    4    | $180M
Ana P.        |     1      |     3     |     4      |    2    | $95M
```

**Seguimiento de cotizaciones**
- Cotizaciones vencidas esta semana (fecha_validez ≤ hoy)
- Cotizaciones sin actividad en > 10 días
- Cotizaciones en revisión hace > 7 días

**Mapa de clientes**
- Segmentación A/B/C por revenue
- Último contacto / última OC
- Clientes sin proyecto activo en > 6 meses

---

## 7. DASHBOARD FINANZAS

> Control financiero: facturación, cobros, flujo de caja y costos.

### KPIs Primarios

| Métrica | Fórmula |
|---------|---------|
| **Facturado (mes)** | Σ facturas emitidas en el período |
| **Cobrado (mes)** | Σ cobros.fecha_cobrado en el período |
| **Por Cobrar Total** | Σ facturas emitidas - cobros aplicados |
| **Por Pagar Total** | Σ facturas recibidas pendientes |
| **Flujo Neto Proyectado** | Por cobrar (30d) − Por pagar (30d) |

### Tabla de Aging — Cuentas por Cobrar

```
Cliente         | 0-30d    | 31-60d  | 61-90d  | +90d    | Total
────────────────────────────────────────────────────────────────────
Cliente A       | $10.2M   | $3.4M   | —       | —       | $13.6M
Cliente B       | —        | $8.1M   | $2.0M   | $5.5M   | $15.6M
```

### Tabla de Aging — Cuentas por Pagar

```
Proveedor       | Vence <7d | 7-15d   | 15-30d  | Vencida | Total
────────────────────────────────────────────────────────────────────
Prov. X         | $4.5M     | —       | $2.1M   | —       | $6.6M
```

### Gráficos
- Flujo de caja proyectado 90 días (línea: ingresos esperados vs egresos)
- Evolución margen bruto por proyecto (barras apiladas)
- Distribución costos por categoría en obras (dona)

### Alertas financieras
- Facturas vencidas sin cobro programado
- Cobros programados esta semana
- Obras con costo_real > presupuesto

---

## 8. DASHBOARD OPERACIONES

> Gestión de obras, personal y proveedores en terreno.

### KPIs Primarios

| Métrica | Descripción |
|---------|-------------|
| **Obras en Ejecución** | COUNT obras WHERE estado = 'en_ejecucion' |
| **Avance Promedio** | AVG(avance_pct) obras activas |
| **Obras Atrasadas** | Obras con fecha_fin_plan < hoy y estado ≠ completada |
| **Eficiencia de Costos** | costo_real / presupuesto × 100 por obra |
| **Personal en Terreno** | COUNT personal activo asignado a obra activa |

### Vista Obras — Tableau de bord

```
Obra          | Estado      | Avance | Presup.  | Costo Real | Delta  | JO
──────────────────────────────────────────────────────────────────────────
OBR-2026-001  | Ejecución   |  68%   | $120M    | $87M       | +$5M   | Carlos R.
OBR-2026-002  | Atrasada ⚠  |  34%   | $45M     | $22M       | -$1M   | María T.
OBR-2026-003  | Planificada |   0%   | $200M    | —          | —      | Felipe M.
```

### Vista Personal

- Disponibilidad del equipo (calendario de asignaciones)
- Personal sin obra asignada (disponible)
- Personas próximas a fin de contrato (< 30 días)

### Vista Proveedores

- OC emitidas sin confirmación > 3 días
- Entregas pendientes esta semana
- Proveedores con calificación < 3 (en lista de revisión)

### Hitos críticos (próximos 30 días)

```
Fecha       | Obra           | Hito                    | Responsable
────────────────────────────────────────────────────────────────────
2026-06-20  | OBR-2026-001   | Entrega estructura       | Carlos R.
2026-06-28  | OBR-2026-002   | Inspección SEC           | María T.
2026-07-05  | OBR-2026-001   | Recepción provisoria     | Carlos R.
```

---

## RESUMEN DE TABLAS

| # | Tabla | Filas estimadas (1 año) | Índices clave |
|---|-------|------------------------|---------------|
| 1 | `clientes` | ~200 | `rut`, `estado`, `ejecutivo_id` |
| 2 | `contactos_cliente` | ~600 | `cliente_id` |
| 3 | `proyectos` | ~300 | `cliente_id`, `estado`, `responsable_id` |
| 4 | `cotizaciones` | ~500 | `proyecto_id`, `estado`, `fecha_validez` |
| 5 | `cotizacion_items` | ~5.000 | `cotizacion_id` |
| 6 | `ordenes_compra` | ~400 | `proyecto_id`, `tipo`, `estado` |
| 7 | `oc_items` | ~4.000 | `oc_id` |
| 8 | `facturas` | ~800 | `tipo`, `estado`, `fecha_vencimiento` |
| 9 | `cobros` | ~1.000 | `factura_id`, `estado`, `fecha_programada` |
| 10 | `obras` | ~150 | `proyecto_id`, `estado`, `jefe_obra_id` |
| 11 | `obra_hitos` | ~750 | `obra_id`, `estado` |
| 12 | `obra_gastos` | ~5.000 | `obra_id`, `categoria` |
| 13 | `personal` | ~80 | `rut`, `departamento`, `estado` |
| 14 | `personal_obra` | ~400 | `personal_id`, `obra_id` |
| 15 | `proveedores` | ~150 | `rut`, `estado`, `categoria` |
| 16 | `cuentas_bancarias` | ~50 | `proveedor_id` |
| 17 | `users` | ~30 | `email`, `rol` |
| 18 | `audit_log` | ~50.000+ | `tabla`, `registro_id`, `created_at` |

---

## PRÓXIMOS PASOS SUGERIDOS

```
Fase 1 — Fundamentos (semanas 1-2)
  ✦ Definir stack tecnológico (PostgreSQL recomendado)
  ✦ Crear migraciones de base de datos
  ✦ Seed de datos maestros (regiones, comunas, bancos)

Fase 2 — Módulo Comercial (semanas 3-6)
  ✦ CRUD Clientes + Contactos
  ✦ CRUD Proyectos
  ✦ Motor de Cotizaciones con generación PDF

Fase 3 — Módulo Financiero (semanas 7-10)
  ✦ OC (cliente y proveedor)
  ✦ Facturas y registro de cobros
  ✦ Dashboard Finanzas

Fase 4 — Módulo Operacional (semanas 11-14)
  ✦ Obras, hitos y gastos
  ✦ Asignación de personal
  ✦ Dashboard Operaciones

Fase 5 — Inteligencia (semanas 15-18)
  ✦ Dashboard CEO
  ✦ Reportes exportables
  ✦ Alertas automáticas por email
```

---

*Dupplo OS V1 — Arquitectura diseñada para escalar sin refactorizar.*
