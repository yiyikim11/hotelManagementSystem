package hotelpms.common.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables @CreatedDate / @LastModifiedDate / @Version on Mongo documents
 * (mirrors the JPA auditing setup for relational entities).
 */
@Configuration
@EnableMongoAuditing
public class MongoAuditingConfig {
}
