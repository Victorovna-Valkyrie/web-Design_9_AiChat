package org.jyj.aichat.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS 配置
 * 注意：使用 Nginx 反向代理时，不需要此配置
 * 因为前后端通过 Nginx 访问同一域名，不存在跨域问题
 *
 * 如果需要直接访问后端（开发环境），取消下面的注释
 */

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:9011", "http://127.0.0.1:9011")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}