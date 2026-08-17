# Esqueleto SaaS - Guia de puesta en marcha para un cliente nuevo

Esta rama (`template/saas-skeleton`) es la base reutilizable del sistema. No contiene
datos de ningun cliente especifico. Incluye:

- Multi-tenancy completo (`Tenant`, `Plan`, middleware `ResolveTenant`, `CheckPlanFeature`, `CheckPlanLimit`).
- Global scope automatico por tenant (`BelongsToTenant` trait) en todos los modelos de dominio.
- 3 planes ya seedeados: Esencial, Pro, IA (ver `PlanSeeder.php` para precios y limites).
- Modulos genericos: autenticacion, productos, inventario con conversion de unidades,
  ventas, cierres de caja, proveedores, sugerencia de compra.
- Funciones exclusivas del Plan IA: escaneo de facturas, precios sugeridos, deteccion de
  productos sin rotacion.
- Endpoint publico de signup (`POST /api/tenants/register`) para alta de un nuevo negocio.

## Pasos para adaptar el sistema a un cliente nuevo

1. Crear una rama desde este esqueleto: `git checkout -b client/nombre-cliente template/saas-skeleton`.
2. Definir el dominio del negocio: editar o crear un seeder propio (ej. `NombreClienteSeeder.php`)
   con sus productos, insumos, recetas, proveedores y conversiones de unidad. No modificar
   `DatabaseSeeder.php` del esqueleto; en su lugar, llamar al seeder del cliente desde ahi
   en la rama del cliente.
3. Elegir el plan inicial del tenant (`esencial`, `pro` o `ia`) segun lo que el cliente pago.
4. Personalizar branding: logo, colores y nombre comercial se guardan en el campo `settings`
   (JSON) del modelo `Tenant`, no en variables de entorno, para que cada cliente pueda tener
   su propio look sin tocar codigo.
5. Si el cliente necesita una feature que no esta en su plan, activarla puntualmente
   editando el JSON `features` de su fila en la tabla `plans` (o creando un plan custom).
6. Ejecutar migraciones y el seeder del cliente:
   `php artisan migrate --seed --seeder=NombreClienteSeeder`.
7. Verificar que el usuario admin generado pueda loguear y que el middleware `tenant`
   resuelva correctamente su `X-Tenant-Slug` o `tenant_id` de usuario.

## Como decidir cambios segun la necesidad de la empresa

- **Limites de uso** (productos, usuarios): se ajustan en la tabla `plans`, no en codigo.
- **Funciones habilitadas**: se ajustan en el JSON `features` de cada plan; el middleware
  `plan.feature:<key>` ya bloquea el acceso si no esta habilitada.
- **Datos y catalogo**: viven en el seeder especifico del cliente, nunca en el esqueleto.
- **Reglas de negocio muy particulares** (ej. una promo especial): se implementan como un
  Service nuevo dentro de la rama del cliente, no dentro del esqueleto, para que el
  esqueleto se mantenga limpio y reutilizable para el siguiente cliente.

## Advertencia de produccion

Antes de fusionar cualquier rama de cliente a `main`, correr:

```
php artisan migrate --pretend   # revisar el SQL sin aplicarlo
php artisan test                # si hay suite de tests
```

Nunca ejecutar `migrate:fresh` en produccion. Usar siempre `migrate` (incremental).
