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
/* 4. SPs DE RESERVAS (dueño: Carnero)                */
/* ================================================== */

CREATE OR ALTER PROCEDURE dbo.sp_Servicios_ListarActivos
AS
BEGIN
    SET NOCOUNT ON;

    SELECT ID_Servicio, Nombre, Descripcion, Precio, DuracionMinutos
    FROM dbo.Servicios
    WHERE Activo = 1
    ORDER BY Nombre;
END;
GO

/* Devuelve el vehículo con los datos de su cliente. Si la patente no existe lanza 50404. */
CREATE OR ALTER PROCEDURE dbo.sp_Vehiculos_BuscarPorPatente
    @Patente VARCHAR(10)
AS
BEGIN
    SET NOCOUNT ON;

    SET @Patente = UPPER(REPLACE(LTRIM(RTRIM(@Patente)), ' ', ''));

    IF NOT EXISTS (SELECT 1 FROM dbo.Vehiculos WHERE Patente = @Patente)
    BEGIN
        THROW 50404, N'No hay ningún vehículo registrado con esa patente.', 1;
    END;

    SELECT v.ID_Vehiculo, v.Patente, v.Marca, v.Modelo, v.TipoVehiculo,
           c.ID_Cliente, c.Nombre, c.Apellido, c.Telefono, c.Email
    FROM dbo.Vehiculos v
    INNER JOIN dbo.Clientes c ON c.ID_Cliente = v.ID_Cliente
    WHERE v.Patente = @Patente;
END;
GO

/* Crea el turno y su detalle en una sola transacción.
   Si la patente ya existe usa ese vehículo; si no, crea el vehículo y busca o crea al cliente
   (mismo nombre, apellido y teléfono), para lo cual los datos del cliente y del vehículo son obligatorios.
   @Servicios es un JSON: [{"idServicio": 1, "cantidad": 2}, ...].
   Errores: 50001 patente vacía, 50002 fecha u hora faltante, 50003 fecha pasada, 50004 sin servicios,
   50005 cantidad inválida, 50006 servicio inexistente o inactivo, 50007 faltan datos del cliente o vehículo,
   50008 el vehículo ya tiene un turno en ese horario. */
CREATE OR ALTER PROCEDURE dbo.sp_Turnos_Crear
    @Patente      VARCHAR(10),
    @Fecha        DATE,
    @Hora         TIME(0),
    @Servicios    NVARCHAR(MAX),
    @Nombre       VARCHAR(100) = NULL,
    @Apellido     VARCHAR(100) = NULL,
    @Telefono     VARCHAR(20)  = NULL,
    @Email        VARCHAR(100) = NULL,
    @Marca        VARCHAR(50)  = NULL,
    @Modelo       VARCHAR(50)  = NULL,
    @TipoVehiculo VARCHAR(30)  = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    SET @Patente = UPPER(REPLACE(LTRIM(RTRIM(ISNULL(@Patente, ''))), ' ', ''));

    IF @Patente = ''
        THROW 50001, N'La patente es obligatoria.', 1;

    IF @Fecha IS NULL OR @Hora IS NULL
        THROW 50002, N'La fecha y la hora son obligatorias.', 1;

    IF DATEADD(SECOND, DATEDIFF(SECOND, CAST('00:00:00' AS TIME(0)), @Hora), CAST(@Fecha AS DATETIME2(0))) < SYSDATETIME()
        THROW 50003, N'No se puede reservar un turno en una fecha u hora pasada.', 1;

    IF ISJSON(@Servicios) <> 1
        THROW 50004, N'Hay que elegir al menos un servicio.', 1;

    -- Si un servicio viene repetido se suman las cantidades
    DECLARE @Detalle TABLE (ID_Servicio INT PRIMARY KEY, Cantidad INT NOT NULL);

    INSERT INTO @Detalle (ID_Servicio, Cantidad)
    SELECT idServicio, SUM(ISNULL(cantidad, 0))
    FROM OPENJSON(@Servicios)
         WITH (idServicio INT '$.idServicio', cantidad INT '$.cantidad')
    WHERE idServicio IS NOT NULL
    GROUP BY idServicio;

    IF NOT EXISTS (SELECT 1 FROM @Detalle)
        THROW 50004, N'Hay que elegir al menos un servicio.', 1;

    IF EXISTS (SELECT 1 FROM @Detalle WHERE Cantidad <= 0)
        THROW 50005, N'La cantidad de cada servicio tiene que ser mayor a cero.', 1;

    IF EXISTS (
        SELECT 1
        FROM @Detalle d
        LEFT JOIN dbo.Servicios s ON s.ID_Servicio = d.ID_Servicio AND s.Activo = 1
        WHERE s.ID_Servicio IS NULL
    )
        THROW 50006, N'Alguno de los servicios elegidos no existe o no está activo.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DECLARE @ID_Vehiculo INT, @ID_Cliente INT, @ID_Turno INT;

        SELECT @ID_Vehiculo = ID_Vehiculo
        FROM dbo.Vehiculos WITH (UPDLOCK, HOLDLOCK)
        WHERE Patente = @Patente;

        IF @ID_Vehiculo IS NULL
        BEGIN
            SET @Nombre       = NULLIF(LTRIM(RTRIM(@Nombre)), '');
            SET @Apellido     = NULLIF(LTRIM(RTRIM(@Apellido)), '');
            SET @Telefono     = NULLIF(LTRIM(RTRIM(@Telefono)), '');
            SET @Email        = NULLIF(LTRIM(RTRIM(@Email)), '');
            SET @Marca        = NULLIF(LTRIM(RTRIM(@Marca)), '');
            SET @Modelo       = NULLIF(LTRIM(RTRIM(@Modelo)), '');
            SET @TipoVehiculo = NULLIF(LTRIM(RTRIM(@TipoVehiculo)), '');

            IF @Nombre IS NULL OR @Apellido IS NULL OR @Telefono IS NULL
               OR @Marca IS NULL OR @Modelo IS NULL OR @TipoVehiculo IS NULL
                THROW 50007, N'La patente es nueva: completá nombre, apellido, teléfono, marca, modelo y tipo de vehículo.', 1;

            SELECT @ID_Cliente = MIN(ID_Cliente)
            FROM dbo.Clientes WITH (UPDLOCK, HOLDLOCK)
            WHERE Nombre = @Nombre AND Apellido = @Apellido AND Telefono = @Telefono;

            IF @ID_Cliente IS NULL
            BEGIN
                INSERT INTO dbo.Clientes (Nombre, Apellido, Telefono, Email)
                VALUES (@Nombre, @Apellido, @Telefono, @Email);

                SET @ID_Cliente = SCOPE_IDENTITY();
            END;

            INSERT INTO dbo.Vehiculos (ID_Cliente, Patente, Marca, Modelo, TipoVehiculo)
            VALUES (@ID_Cliente, @Patente, @Marca, @Modelo, @TipoVehiculo);

            SET @ID_Vehiculo = SCOPE_IDENTITY();
        END;

        IF EXISTS (
            SELECT 1 FROM dbo.Turnos
            WHERE ID_Vehiculo = @ID_Vehiculo AND Fecha = @Fecha AND Hora = @Hora AND Estado <> 'Cancelado'
        )
            THROW 50008, N'Ese vehículo ya tiene un turno reservado en esa fecha y hora.', 1;

        INSERT INTO dbo.Turnos (ID_Vehiculo, Fecha, Hora)
        VALUES (@ID_Vehiculo, @Fecha, @Hora);

        SET @ID_Turno = SCOPE_IDENTITY();

        -- El precio queda congelado en el detalle: un cambio de precio posterior no afecta turnos ya reservados
        INSERT INTO dbo.DetalleTurno (ID_Turno, ID_Servicio, Cantidad, PrecioUnitario)
        SELECT @ID_Turno, d.ID_Servicio, d.Cantidad, s.Precio
        FROM @Detalle d
        INNER JOIN dbo.Servicios s ON s.ID_Servicio = d.ID_Servicio;

        COMMIT TRANSACTION;

        SELECT t.ID_Turno, CONVERT(CHAR(10), t.Fecha, 23) AS Fecha, CONVERT(CHAR(5), t.Hora, 108) AS Hora, t.Estado, v.Patente,
               (SELECT SUM(Subtotal) FROM dbo.DetalleTurno WHERE ID_Turno = t.ID_Turno) AS Total
        FROM dbo.Turnos t
        INNER JOIN dbo.Vehiculos v ON v.ID_Vehiculo = t.ID_Vehiculo
        WHERE t.ID_Turno = @ID_Turno;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        THROW;
    END CATCH;
END;
GO


/* ================================================== */
/* 5. SPs DE TABLERO Y ESTADISTICAS (dueño: Bosetti)  */
/* ================================================== */


/* (si son 3 integrantes, agregar la seccion 6 con el mismo cartel) */
