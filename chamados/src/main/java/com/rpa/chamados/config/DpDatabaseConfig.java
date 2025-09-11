package com.rpa.chamados.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

@Configuration
public class DpDatabaseConfig {

    @Value("${dp-db.url}")
    private String url;

    @Value("${dp-db.username}")
    private String username;

    @Value("${dp-db.password}")
    private String password;

    @Bean(name = "dpDataSource")
    @Qualifier("dpDataSource")
    public DataSource dpDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setDriverClassName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        
        // Configurações adicionais para evitar conflitos
        dataSource.setPoolName("DpConnectionPool");
        dataSource.setMaximumPoolSize(5);
        dataSource.setMinimumIdle(1);
        
        return dataSource;
    }

    @Bean(name = "dpJdbcTemplate")
    @Qualifier("dpJdbcTemplate")
    public JdbcTemplate dpJdbcTemplate(@Qualifier("dpDataSource") DataSource dpDataSource) {
        return new JdbcTemplate(dpDataSource);
    }

}
