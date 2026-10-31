/* Script autosuficiente: se puede ejecutar dos veces sin romper nada.
   La base no viaja por Git, viaja este script: si un cambio no esta aca, para el equipo no existe.
   Se mantiene a mano (nada de "Generar scripts" de SSMS). Usar CREATE OR ALTER en los SPs
   y IF NOT EXISTS en lo demas.
   Ejecutar completo en SQL Server Express (localhost\SQLEXPRESS) con un usuario administrador. */

/* ================================================== */
/* 1. BASE, LOGIN prog2 Y PERMISOS (no tocar)         */
/* ================================================== */

IF DB_ID('LavaderoDB') IS NULL
BEGIN
    CREATE DATABASE LavaderoDB;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.server_principals WHERE name = N'prog2')
BEGIN
    CREATE LOGIN prog2 WITH PASSWORD = N'Prog2.2026', CHECK_POLICY = OFF;
END;
GO

USE LavaderoDB;
GO

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'prog2')
BEGIN
    CREATE USER prog2 FOR LOGIN prog2;
END;
GO

ALTER ROLE db_owner ADD MEMBER prog2;
GO

/* ================================================== */
/* 2. TABLAS Y FOREIGN KEYS (cambios: avisar al grupo)*/
/* ================================================== */

IF OBJECT_ID('dbo.Clientes', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Clientes (
        ID_Cliente INT IDENTITY(1,1) NOT NULL,
        Nombre     VARCHAR(100) NOT NULL,
        Apellido   VARCHAR(100) NOT NULL,
        Telefono   VARCHAR(20)  NOT NULL,
        Email      VARCHAR(100) NULL,
        CONSTRAINT PK_Clientes PRIMARY KEY (ID_Cliente)
    );
END;
GO

IF OBJECT_ID('dbo.Vehiculos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Vehiculos (
        ID_Vehiculo  INT IDENTITY(1,1) NOT NULL,
        ID_Cliente   INT         NOT NULL,          -- FK hacia Clientes
        Patente      VARCHAR(10) NOT NULL,
        Marca        VARCHAR(50) NOT NULL,
        Modelo       VARCHAR(50) NOT NULL,
        TipoVehiculo VARCHAR(30) NOT NULL,
        CONSTRAINT PK_Vehiculos PRIMARY KEY (ID_Vehiculo),
        CONSTRAINT UQ_Vehiculos_Patente UNIQUE (Patente),
        CONSTRAINT FK_Vehiculos_Clientes
            FOREIGN KEY (ID_Cliente) REFERENCES dbo.Clientes (ID_Cliente)
    );
END;
GO

IF OBJECT_ID('dbo.Servicios', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Servicios (
        ID_Servicio     INT IDENTITY(1,1) NOT NULL,
        Nombre          VARCHAR(100)  NOT NULL,
        Descripcion     VARCHAR(255)  NULL,
        Precio          DECIMAL(10,2) NOT NULL,
        DuracionMinutos INT           NOT NULL,
        Activo          BIT           NOT NULL CONSTRAINT DF_Servicios_Activo DEFAULT (1),
        CONSTRAINT PK_Servicios PRIMARY KEY (ID_Servicio),
        CONSTRAINT CK_Servicios_Precio CHECK (Precio >= 0),
        CONSTRAINT CK_Servicios_Duracion CHECK (DuracionMinutos > 0)
    );
END;
GO

IF OBJECT_ID('dbo.Turnos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Turnos (
        ID_Turno     INT IDENTITY(1,1) NOT NULL,
        ID_Vehiculo  INT         NOT NULL,          -- FK hacia Vehiculos
        Fecha        DATE        NOT NULL,
        Hora         TIME(0)     NOT NULL,
        Estado       VARCHAR(20) NOT NULL CONSTRAINT DF_Turnos_Estado DEFAULT ('Pendiente'),
        FechaReserva DATETIME2(0) NOT NULL CONSTRAINT DF_Turnos_FechaReserva DEFAULT (SYSDATETIME()),
        CONSTRAINT PK_Turnos PRIMARY KEY (ID_Turno),
        CONSTRAINT FK_Turnos_Vehiculos
            FOREIGN KEY (ID_Vehiculo) REFERENCES dbo.Vehiculos (ID_Vehiculo),
        CONSTRAINT CK_Turnos_Estado
            CHECK (Estado IN ('Pendiente', 'Confirmado', 'EnProceso', 'Finalizado', 'Cancelado'))
    );
END;
GO

IF OBJECT_ID('dbo.DetalleTurno', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.DetalleTurno (
        ID_Detalle     INT IDENTITY(1,1) NOT NULL,
        ID_Turno       INT           NOT NULL,      -- FK hacia Turnos
        ID_Servicio    INT           NOT NULL,      -- FK hacia Servicios
        Cantidad       INT           NOT NULL,
        PrecioUnitario DECIMAL(10,2) NOT NULL,      -- precio aplicado al reservar
        Subtotal AS CAST(Cantidad * PrecioUnitario AS DECIMAL(10,2)) PERSISTED, -- lo calcula siempre la base
        CONSTRAINT PK_DetalleTurno PRIMARY KEY (ID_Detalle),
        CONSTRAINT FK_DetalleTurno_Turnos
            FOREIGN KEY (ID_Turno) REFERENCES dbo.Turnos (ID_Turno),
        CONSTRAINT FK_DetalleTurno_Servicios
            FOREIGN KEY (ID_Servicio) REFERENCES dbo.Servicios (ID_Servicio),
        CONSTRAINT CK_DetalleTurno_Cantidad CHECK (Cantidad > 0),
        CONSTRAINT CK_DetalleTurno_Precio CHECK (PrecioUnitario >= 0)
    );
END;
GO

/* ================================================== */
/* 3. DATOS DE EJEMPLO                                */
/* ================================================== */

IF NOT EXISTS (SELECT 1 FROM dbo.Clientes)
BEGIN
    INSERT INTO dbo.Clientes (Nombre, Apellido, Telefono, Email) VALUES
        ('Martín',   'Gómez',     '3534112233', 'martin.gomez@gmail.com'),
        ('Lucía',    'Fernández', '3534223344', 'lucia.fernandez@gmail.com'),
        ('Carlos',   'Ríos',      '3534334455', NULL),
        ('Valentina','Soria',     '3534445566', 'vale.soria@hotmail.com'),
        ('Jorge',    'Peralta',   '3534556677', 'jorge.peralta@gmail.com');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Vehiculos)
BEGIN
    INSERT INTO dbo.Vehiculos (ID_Cliente, Patente, Marca, Modelo, TipoVehiculo) VALUES
        (1, 'AB123CD', 'Volkswagen', 'Gol Trend', 'Auto'),
        (1, 'AF456GH', 'Toyota',     'Hilux',     'Camioneta'),
        (2, 'AC789EF', 'Fiat',       'Cronos',    'Auto'),
        (3, 'AD321KL', 'Renault',    'Kangoo',    'Utilitario'),
        (4, 'AE654MN', 'Peugeot',    '208',       'Auto'),
        (5, 'AG987PQ', 'Ford',       'Ranger',    'Camioneta');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Servicios)
BEGIN
    INSERT INTO dbo.Servicios (Nombre, Descripcion, Precio, DuracionMinutos, Activo) VALUES
        ('Lavado exterior',        'Lavado de carrocería, llantas y vidrios',               8000.00,  30, 1),
        ('Lavado completo',        'Exterior más aspirado y limpieza de interior',         15000.00,  60, 1),
        ('Limpieza de tapizados',  'Lavado profundo de asientos y alfombras',              28000.00, 120, 1),
        ('Encerado',               'Cera protectora con acabado brillante',                18000.00,  60, 1),
        ('Lavado de motor',        'Limpieza y desengrasado del vano motor',               12000.00,  45, 1),
        ('Tratamiento cerámico',   'Servicio suspendido temporalmente',                    90000.00, 180, 0);
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Turnos)
BEGIN
    INSERT INTO dbo.Turnos (ID_Vehiculo, Fecha, Hora, Estado, FechaReserva) VALUES
        (1, '2026-11-02', '09:00', 'Pendiente',  '2026-10-30T10:15:00'),
        (3, '2026-11-02', '10:30', 'Confirmado', '2026-10-30T11:40:00'),
        (2, '2026-11-03', '09:00', 'EnProceso',  '2026-10-29T18:05:00'),
        (5, '2026-11-03', '15:00', 'Finalizado', '2026-10-28T09:20:00'),
        (4, '2026-11-04', '11:00', 'Cancelado',  '2026-10-29T12:00:00'),
        (6, '2026-11-05', '16:30', 'Pendiente',  '2026-10-31T08:45:00');
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.DetalleTurno)
BEGIN
    -- PrecioUnitario conserva el precio vigente al reservar; Subtotal lo calcula la base
    INSERT INTO dbo.DetalleTurno (ID_Turno, ID_Servicio, Cantidad, PrecioUnitario) VALUES
        (1, 2,  1, 15000.00),
        (2, 1,  1,  8000.00),
        (2, 4,  1, 18000.00),
        (3, 2,  1, 15000.00),
        (3, 5,  1, 12000.00),
        (4, 3,  1, 28000.00),
        (5, 1,  1,  8000.00),
        (6, 2,  1, 15000.00),
        (6, 4,  1, 18000.00);
END;
GO

/* ================================================== */
/* 4. SPs DE ______ (dueño: ______)                   */
/* ================================================== */


/* ================================================== */
/* 5. SPs DE ______ (dueño: ______)                   */
/* ================================================== */


/* (si son 3 integrantes, agregar la seccion 6 con el mismo cartel) */
