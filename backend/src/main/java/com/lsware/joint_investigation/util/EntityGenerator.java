package com.lsware.joint_investigation.util;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EntityGenerator {

    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/test_gem";
        String user = "admin";
        String password = "password";

        try (Connection conn = DriverManager.getConnection(url, user, password)) {
            DatabaseMetaData metaData = conn.getMetaData();
            ResultSet tables = metaData.getTables(null, "public", "%", new String[] { "TABLE" });

            while (tables.next()) {
                String tableName = tables.getString("TABLE_NAME");
                generateEntity(conn, tableName);
            }

            System.out.println("Entity generation completed!");

        } catch (SQLException | IOException e) {
            e.printStackTrace();
        }
    }

    private static void generateEntity(Connection conn, String tableName) throws SQLException, IOException {
        DatabaseMetaData metaData = conn.getMetaData();
        ResultSet columns = metaData.getColumns(null, "public", tableName, "%");

        StringBuilder entityCode = new StringBuilder();
        entityCode.append("package com.lsware.joint_investigation.entity;\n\n");
        entityCode.append("import jakarta.persistence.*;\n");
        entityCode.append("import lombok.*;\n");
        entityCode.append("import java.time.*;\n");
        entityCode.append("import java.math.BigDecimal;\n\n");

        entityCode.append("@Entity\n");
        entityCode.append("@Table(name = \"").append(tableName).append("\")\n");
        entityCode.append("@Data\n");
        entityCode.append("@NoArgsConstructor\n");
        entityCode.append("@AllArgsConstructor\n");

        String className = toPascalCase(tableName);
        entityCode.append("public class ").append(className).append(" {\n\n");

        while (columns.next()) {
            String columnName = columns.getString("COLUMN_NAME");
            String dataType = columns.getString("TYPE_NAME");
            String isNullable = columns.getString("IS_NULLABLE");

            entityCode.append("    @Column(name = \"").append(columnName).append("\"");
            if ("NO".equals(isNullable)) {
                entityCode.append(", nullable = false");
            }
            entityCode.append(")\n");

            String javaType = getJavaType(dataType);
            String fieldName = toCamelCaseField(columnName);
            entityCode.append("    private ").append(javaType).append(" ").append(fieldName).append(";\n\n");
        }

        entityCode.append("}\n");

        // Write to file
        File outputDir = new File("src/main/java/com/lsware/joint_investigation/entity");
        outputDir.mkdirs();

        File outputFile = new File(outputDir, className + ".java");
        try (FileWriter writer = new FileWriter(outputFile)) {
            writer.write(entityCode.toString());
        }

        System.out.println("Generated: " + outputFile.getAbsolutePath());
    }

    // Convert table name to PascalCase (class name)
    private static String toPascalCase(String input) {
        String[] parts = input.toLowerCase().split("_");
        StringBuilder result = new StringBuilder();
        for (String part : parts) {
            if (part.length() > 0) {
                result.append(Character.toUpperCase(part.charAt(0)));
                result.append(part.substring(1));
            }
        }
        return result.toString();
    }

    // Convert column name to camelCase (field name)
    private static String toCamelCaseField(String input) {
        String pascal = toPascalCase(input);
        return pascal.substring(0, 1).toLowerCase() + pascal.substring(1);
    }

    // Map SQL types to Java types
    private static String getJavaType(String sqlType) {
        switch (sqlType.toUpperCase()) {
            case "BIGINT":
                return "Long";
            case "INTEGER":
            case "INT":
                return "Integer";
            case "SMALLINT":
                return "Short";
            case "VARCHAR":
            case "CHAR":
            case "TEXT":
                return "String";
            case "BOOLEAN":
                return "Boolean";
            case "DECIMAL":
            case "NUMERIC":
                return "BigDecimal";
            case "DOUBLE":
            case "FLOAT":
                return "Double";
            case "DATE":
                return "LocalDate";
            case "TIMESTAMP":
                return "LocalDateTime";
            case "TIME":
                return "LocalTime";
            default:
                return "String";
        }
    }
}
