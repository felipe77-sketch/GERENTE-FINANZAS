# Dupplo OS V1

Sistema de gestión empresarial para constructoras y empresas de servicios.
Construido con **Next.js 14**, **TypeScript**, **Tailwind CSS**, **Supabase** y **Recharts**.

> **Modo demo incluido:** la aplicación funciona de inmediato con datos de ejemplo
> realistas, incluso sin configurar Supabase. Cuando conectes Supabase, los datos
> reales reemplazan automáticamente a los de demostración.

## Módulos

- **Clientes** — cartera de clientes (crear, ver, editar, eliminar)
- **Proyectos** — proyectos con presupuesto y responsable
- **Cotizaciones** — cotizaciones con ítems de línea y flujo de estados
- **Órdenes de Compra** — OC a clientes y proveedores
- **Facturas** — facturas emitidas y recibidas
- **Cobros** — seguimiento de cobranzas
- **Obras** — obras de construcción con avance %
- **Personal** — gestión de equipo
- **Proveedores** — gestión de proveedores

## Dashboards

- **CEO** — ingresos YTD, pipeline, margen, DSO, aging y alertas
- **Comercial** — embudo de pipeline, cotizaciones por estado, tasa de conversión
- **Finanzas** — cuentas por cobrar/pagar, proyección de flujo de caja a 90 días
- **Operaciones** — estado de obras, avance %, personal asignado

---

## Guía paso a paso (para no programadores)

### 1. Requisitos

- Una cuenta gratuita en [Supabase](https://supabase.com) (base de datos)
- Una cuenta gratuita en [Vercel](https://vercel.com) (publicar la app)
- Una cuenta en [GitHub](https://github.com) (alojar el código)

### 2. Crear la base de datos en Supabase

1. Entra a [supabase.com](https://supabase.com) y crea un proyecto nuevo.
   Anota la contraseña de la base de datos.
2. Cuando el proyecto esté listo, ve al menú izquierdo → **SQL Editor** → **New query**.
3. Abre el archivo `supabase/migrations/001_initial_schema.sql` de este repositorio,
   **copia todo su contenido**, pégalo en el editor y presiona **Run**.
   Esto crea todas las tablas y carga datos de ejemplo.
4. Ve a **Settings** (engranaje) → **API** y copia dos valores:
   - **Project URL** (ej: `https://abcd1234.supabase.co`)
   - **anon public** key (una clave larga)

### 3. Configurar las variables de entorno

1. Copia el archivo `.env.example` a `.env.local`.
2. Pega tus valores:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   ```

### 4. Probar en tu computador (opcional)

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 5. Publicar en Vercel

1. Sube este proyecto a un repositorio de GitHub.
2. Entra a [vercel.com](https://vercel.com) → **Add New Project** → importa tu repo.
3. En **Environment Variables** agrega las mismas dos variables del paso 3
   (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Presiona **Deploy**. En 1-2 minutos tendrás tu app en línea con una URL pública.

---

## Notas técnicas

- **Sin Supabase configurado:** la app usa datos de ejemplo en memoria. Puedes crear
  y editar registros durante la sesión, pero no se guardan permanentemente.
- **Con Supabase configurado:** todas las operaciones (crear, editar, eliminar)
  persisten en la base de datos.
- **Moneda:** pesos chilenos con separador de miles (ej: `$12.450.000`).
- **Fechas:** formato chileno `dd/mm/aaaa`.

## Estructura del proyecto

```
src/
  app/            páginas (dashboards + módulos)
  components/
    layout/       Sidebar, TopBar
    ui/           componentes base (estilo shadcn/ui)
    shared/       DataTable, StatusBadge, Modal, CurrencyInput, PageHeader
  lib/            supabase, data, utils, types, mock-data, lookups
  hooks/          useCollection (CRUD)
supabase/
  migrations/     esquema SQL + datos de ejemplo
```

© 2026 Dupplo SpA
