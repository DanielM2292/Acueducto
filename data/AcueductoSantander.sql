-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: acueducto_santander
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administradores`
--

DROP TABLE IF EXISTS `administradores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administradores` (
  `id_administrador` varchar(10) NOT NULL,
  `nombre` varchar(80) DEFAULT NULL,
  `nombre_usuario` varchar(50) DEFAULT NULL,
  `password` varchar(64) DEFAULT NULL,
  `id_estado_empleado` varchar(10) DEFAULT NULL,
  `id_rol` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_administrador`),
  KEY `id_rol` (`id_rol`),
  KEY `id_estado_empleado` (`id_estado_empleado`),
  CONSTRAINT `administradores_ibfk_1` FOREIGN KEY (`id_rol`) REFERENCES `roles_permisos` (`id_rol`),
  CONSTRAINT `administradores_ibfk_2` FOREIGN KEY (`id_estado_empleado`) REFERENCES `estado_empleados` (`id_estado_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `administradores`
--

LOCK TABLES `administradores` WRITE;
/*!40000 ALTER TABLE `administradores` DISABLE KEYS */;
INSERT INTO `administradores` VALUES ('ADM0001','Administrador','admin','8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918','EMP0001','ROL0001');
/*!40000 ALTER TABLE `administradores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria`
--

DROP TABLE IF EXISTS `auditoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auditoria` (
  `id_auditoria` varchar(10) NOT NULL,
  `tabla` varchar(50) DEFAULT NULL,
  `id_registro_afectado` varchar(50) DEFAULT NULL,
  `accion` varchar(10) DEFAULT NULL COMMENT 'INSERT, UPDATE, DELETE',
  `id_administrador` varchar(50) DEFAULT NULL,
  `fecha` datetime DEFAULT CURRENT_TIMESTAMP,
  `detalles` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_auditoria`),
  KEY `id_administrador` (`id_administrador`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`id_administrador`) REFERENCES `administradores` (`id_administrador`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria`
--

LOCK TABLES `auditoria` WRITE;
/*!40000 ALTER TABLE `auditoria` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id_cliente` varchar(10) NOT NULL,
  `tipo_documento` varchar(10) DEFAULT NULL,
  `numero_documento` varchar(50) DEFAULT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `egresos`
--

DROP TABLE IF EXISTS `egresos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `egresos` (
  `id_egreso` varchar(10) NOT NULL,
  `descripcion_egreso` varchar(255) DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `total_egreso` int DEFAULT NULL,
  `fecha_egreso` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_producto` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_egreso`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `egresos_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `inventario` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `egresos`
--

LOCK TABLES `egresos` WRITE;
/*!40000 ALTER TABLE `egresos` DISABLE KEYS */;
/*!40000 ALTER TABLE `egresos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_clientes`
--

DROP TABLE IF EXISTS `estado_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_clientes` (
  `id_estado_cliente` varchar(10) NOT NULL,
  `descripcion_cliente` varchar(50) DEFAULT NULL COMMENT 'activo inactivo suspendido',
  PRIMARY KEY (`id_estado_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_clientes`
--

LOCK TABLES `estado_clientes` WRITE;
/*!40000 ALTER TABLE `estado_clientes` DISABLE KEYS */;
INSERT INTO `estado_clientes` VALUES ('ESC0001','Activo'),('ESC0002','Inactivo'),('ESC0003','Suspendido');
/*!40000 ALTER TABLE `estado_clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_empleados`
--

DROP TABLE IF EXISTS `estado_empleados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_empleados` (
  `id_estado_empleado` varchar(10) NOT NULL,
  `descripcion_empleado` varchar(50) DEFAULT NULL COMMENT 'activo inactivo varchar',
  PRIMARY KEY (`id_estado_empleado`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_empleados`
--

LOCK TABLES `estado_empleados` WRITE;
/*!40000 ALTER TABLE `estado_empleados` DISABLE KEYS */;
INSERT INTO `estado_empleados` VALUES ('EMP0001','Activo'),('EMP0002','Inactivo');
/*!40000 ALTER TABLE `estado_empleados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_facturas`
--

DROP TABLE IF EXISTS `estado_facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_facturas` (
  `id_estado_factura` varchar(10) NOT NULL,
  `descripcion_estado_factura` varchar(50) DEFAULT NULL COMMENT 'pendiente pagada vencida',
  PRIMARY KEY (`id_estado_factura`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_facturas`
--

LOCK TABLES `estado_facturas` WRITE;
/*!40000 ALTER TABLE `estado_facturas` DISABLE KEYS */;
INSERT INTO `estado_facturas` VALUES ('ESF0001','Pendiente'),('ESF0002','Pagada'),('ESF0003','Vencida');
/*!40000 ALTER TABLE `estado_facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estado_multas`
--

DROP TABLE IF EXISTS `estado_multas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estado_multas` (
  `id_estado_multa` varchar(10) NOT NULL,
  `descripcion_multa` varchar(50) DEFAULT NULL COMMENT 'cancelado pendiente',
  PRIMARY KEY (`id_estado_multa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estado_multas`
--

LOCK TABLES `estado_multas` WRITE;
/*!40000 ALTER TABLE `estado_multas` DISABLE KEYS */;
INSERT INTO `estado_multas` VALUES ('ESM0001','Pendiente'),('ESM0002','Cancelado');
/*!40000 ALTER TABLE `estado_multas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `estandar_factura`
--

DROP TABLE IF EXISTS `estandar_factura`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estandar_factura` (
  `id_estandar_factura` varchar(10) NOT NULL,
  `id_tarifa_estandar` varchar(10) DEFAULT NULL,
  `id_matricula_cliente` varchar(10) DEFAULT NULL,
  `cantidad_meses` int DEFAULT NULL,
  PRIMARY KEY (`id_estandar_factura`),
  KEY `id_tarifa_estandar` (`id_tarifa_estandar`),
  KEY `id_matricula_cliente` (`id_matricula_cliente`),
  CONSTRAINT `estandar_factura_ibfk_1` FOREIGN KEY (`id_tarifa_estandar`) REFERENCES `tarifas_estandar` (`id_tarifa_estandar`),
  CONSTRAINT `estandar_factura_ibfk_2` FOREIGN KEY (`id_matricula_cliente`) REFERENCES `matricula_cliente` (`id_matricula_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `estandar_factura`
--

LOCK TABLES `estandar_factura` WRITE;
/*!40000 ALTER TABLE `estandar_factura` DISABLE KEYS */;
/*!40000 ALTER TABLE `estandar_factura` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `facturas`
--

DROP TABLE IF EXISTS `facturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `facturas` (
  `id_factura` varchar(10) NOT NULL,
  `fecha_factura` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_vencimiento` datetime DEFAULT NULL,
  `id_cliente` varchar(10) DEFAULT NULL,
  `id_estado_factura` varchar(10) DEFAULT NULL,
  `valor_pendiente` int DEFAULT NULL,
  `id_matricula_cliente` varchar(10) DEFAULT NULL,
  `id_estandar_factura` varchar(10) DEFAULT NULL,
  `id_tarifa_medidor` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_factura`),
  KEY `id_estado_factura` (`id_estado_factura`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_matricula_cliente` (`id_matricula_cliente`),
  KEY `id_estandar_factura` (`id_estandar_factura`),
  KEY `id_tarifa_medidor` (`id_tarifa_medidor`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`id_estado_factura`) REFERENCES `estado_facturas` (`id_estado_factura`),
  CONSTRAINT `facturas_ibfk_2` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `facturas_ibfk_3` FOREIGN KEY (`id_matricula_cliente`) REFERENCES `matricula_cliente` (`id_matricula_cliente`),
  CONSTRAINT `facturas_ibfk_4` FOREIGN KEY (`id_estandar_factura`) REFERENCES `estandar_factura` (`id_estandar_factura`),
  CONSTRAINT `facturas_ibfk_5` FOREIGN KEY (`id_tarifa_medidor`) REFERENCES `tarifa_medidores` (`id_tarifa_medidor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `facturas`
--

LOCK TABLES `facturas` WRITE;
/*!40000 ALTER TABLE `facturas` DISABLE KEYS */;
/*!40000 ALTER TABLE `facturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ingresos`
--

DROP TABLE IF EXISTS `ingresos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ingresos` (
  `id_ingreso` varchar(10) NOT NULL,
  `descripcion_ingreso` varchar(255) DEFAULT NULL,
  `valor_ingreso` int DEFAULT NULL,
  `fecha_ingreso` datetime DEFAULT CURRENT_TIMESTAMP,
  `id_matricula` varchar(10) DEFAULT NULL,
  `id_factura` varchar(10) DEFAULT NULL,
  `id_producto` varchar(10) DEFAULT NULL,
  `id_multa` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_ingreso`),
  KEY `id_multa` (`id_multa`),
  KEY `id_factura` (`id_factura`),
  KEY `id_matricula` (`id_matricula`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `ingresos_ibfk_1` FOREIGN KEY (`id_multa`) REFERENCES `multas` (`id_multa`),
  CONSTRAINT `ingresos_ibfk_2` FOREIGN KEY (`id_factura`) REFERENCES `facturas` (`id_factura`),
  CONSTRAINT `ingresos_ibfk_3` FOREIGN KEY (`id_matricula`) REFERENCES `matriculas` (`id_matricula`),
  CONSTRAINT `ingresos_ibfk_4` FOREIGN KEY (`id_producto`) REFERENCES `inventario` (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ingresos`
--

LOCK TABLES `ingresos` WRITE;
/*!40000 ALTER TABLE `ingresos` DISABLE KEYS */;
/*!40000 ALTER TABLE `ingresos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventario`
--

DROP TABLE IF EXISTS `inventario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `inventario` (
  `id_producto` varchar(10) NOT NULL,
  `descripcion_producto` varchar(255) DEFAULT NULL,
  `cantidad` int DEFAULT NULL,
  `valor_producto` int DEFAULT NULL,
  `total_productos` int DEFAULT NULL,
  `fecha_producto` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_producto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventario`
--

LOCK TABLES `inventario` WRITE;
/*!40000 ALTER TABLE `inventario` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matricula_cliente`
--

DROP TABLE IF EXISTS `matricula_cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matricula_cliente` (
  `id_matricula_cliente` varchar(10) NOT NULL,
  `id_matricula` varchar(10) DEFAULT NULL,
  `id_cliente` varchar(10) DEFAULT NULL,
  `direccion` varchar(80) DEFAULT NULL,
  `id_estado_cliente` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_matricula_cliente`),
  KEY `id_estado_cliente` (`id_estado_cliente`),
  KEY `id_matricula` (`id_matricula`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `matricula_cliente_ibfk_1` FOREIGN KEY (`id_estado_cliente`) REFERENCES `estado_clientes` (`id_estado_cliente`),
  CONSTRAINT `matricula_cliente_ibfk_2` FOREIGN KEY (`id_matricula`) REFERENCES `matriculas` (`id_matricula`),
  CONSTRAINT `matricula_cliente_ibfk_3` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matricula_cliente`
--

LOCK TABLES `matricula_cliente` WRITE;
/*!40000 ALTER TABLE `matricula_cliente` DISABLE KEYS */;
/*!40000 ALTER TABLE `matricula_cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `matriculas`
--

DROP TABLE IF EXISTS `matriculas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `matriculas` (
  `id_matricula` varchar(10) NOT NULL,
  `numero_matricula` varchar(10) DEFAULT NULL,
  `valor_matricula` int DEFAULT NULL,
  `tipo_tarifa` varchar(50) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_matricula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `matriculas`
--

LOCK TABLES `matriculas` WRITE;
/*!40000 ALTER TABLE `matriculas` DISABLE KEYS */;
/*!40000 ALTER TABLE `matriculas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `multa_clientes`
--

DROP TABLE IF EXISTS `multa_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `multa_clientes` (
  `id_multa_cliente` varchar(10) NOT NULL,
  `id_multa` varchar(10) DEFAULT NULL,
  `id_cliente` varchar(10) DEFAULT NULL,
  `id_estado_multa` varchar(10) DEFAULT NULL,
  `id_matricula_cliente` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_multa_cliente`),
  KEY `id_matricula_cliente` (`id_matricula_cliente`),
  KEY `id_multa` (`id_multa`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_estado_multa` (`id_estado_multa`),
  CONSTRAINT `multa_clientes_ibfk_1` FOREIGN KEY (`id_matricula_cliente`) REFERENCES `matricula_cliente` (`id_matricula_cliente`),
  CONSTRAINT `multa_clientes_ibfk_2` FOREIGN KEY (`id_multa`) REFERENCES `multas` (`id_multa`),
  CONSTRAINT `multa_clientes_ibfk_3` FOREIGN KEY (`id_cliente`) REFERENCES `clientes` (`id_cliente`),
  CONSTRAINT `multa_clientes_ibfk_4` FOREIGN KEY (`id_estado_multa`) REFERENCES `estado_multas` (`id_estado_multa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `multa_clientes`
--

LOCK TABLES `multa_clientes` WRITE;
/*!40000 ALTER TABLE `multa_clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `multa_clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `multas`
--

DROP TABLE IF EXISTS `multas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `multas` (
  `id_multa` varchar(10) NOT NULL,
  `motivo_multa` varchar(255) DEFAULT NULL,
  `valor_multa` int DEFAULT NULL,
  `valor_pendiente` int DEFAULT NULL,
  PRIMARY KEY (`id_multa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `multas`
--

LOCK TABLES `multas` WRITE;
/*!40000 ALTER TABLE `multas` DISABLE KEYS */;
/*!40000 ALTER TABLE `multas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles_permisos`
--

DROP TABLE IF EXISTS `roles_permisos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles_permisos` (
  `id_rol` varchar(10) NOT NULL,
  `tipo_rol` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles_permisos`
--

LOCK TABLES `roles_permisos` WRITE;
/*!40000 ALTER TABLE `roles_permisos` DISABLE KEYS */;
INSERT INTO `roles_permisos` VALUES ('ROL0001','Administrador'),('ROL0002','Secretario'),('ROL0003','Contador');
/*!40000 ALTER TABLE `roles_permisos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarifa_medidores`
--

DROP TABLE IF EXISTS `tarifa_medidores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarifa_medidores` (
  `id_tarifa_medidor` varchar(10) NOT NULL,
  `lectura_actual` int DEFAULT NULL,
  `id_valores_medidor` varchar(10) DEFAULT NULL,
  `valor_total_lectura` int DEFAULT NULL,
  `id_matricula_cliente` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id_tarifa_medidor`),
  KEY `id_valores_medidor` (`id_valores_medidor`),
  KEY `id_matricula_cliente` (`id_matricula_cliente`),
  CONSTRAINT `tarifa_medidores_ibfk_1` FOREIGN KEY (`id_valores_medidor`) REFERENCES `valores_medidor` (`id_valores_medidor`),
  CONSTRAINT `tarifa_medidores_ibfk_2` FOREIGN KEY (`id_matricula_cliente`) REFERENCES `matricula_cliente` (`id_matricula_cliente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifa_medidores`
--

LOCK TABLES `tarifa_medidores` WRITE;
/*!40000 ALTER TABLE `tarifa_medidores` DISABLE KEYS */;
/*!40000 ALTER TABLE `tarifa_medidores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tarifas_estandar`
--

DROP TABLE IF EXISTS `tarifas_estandar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tarifas_estandar` (
  `id_tarifa_estandar` varchar(10) NOT NULL,
  `tarifa_definida` int DEFAULT NULL,
  `fecha_inicio_tarifa` datetime DEFAULT NULL,
  `fecha_final_tarifa` datetime DEFAULT NULL,
  PRIMARY KEY (`id_tarifa_estandar`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tarifas_estandar`
--

LOCK TABLES `tarifas_estandar` WRITE;
/*!40000 ALTER TABLE `tarifas_estandar` DISABLE KEYS */;
/*!40000 ALTER TABLE `tarifas_estandar` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `valores_medidor`
--

DROP TABLE IF EXISTS `valores_medidor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `valores_medidor` (
  `id_valores_medidor` varchar(10) NOT NULL,
  `valor_metro3` int DEFAULT NULL,
  PRIMARY KEY (`id_valores_medidor`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `valores_medidor`
--

LOCK TABLES `valores_medidor` WRITE;
/*!40000 ALTER TABLE `valores_medidor` DISABLE KEYS */;
/*!40000 ALTER TABLE `valores_medidor` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-03-10 21:30:39
