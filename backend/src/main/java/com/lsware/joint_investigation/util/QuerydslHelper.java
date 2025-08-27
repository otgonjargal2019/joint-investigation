package com.lsware.joint_investigation.util;

import org.springframework.data.domain.Sort;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.Path;
import com.querydsl.core.types.dsl.EntityPathBase;
import com.querydsl.core.types.dsl.PathBuilder;

public class QuerydslHelper {
    @SuppressWarnings({ "unchecked", "rawtypes" })
    public static OrderSpecifier<?>[] getSortedColumn(EntityPathBase<?> path, Sort sort) {
        return sort.stream()
                .map(order -> {
                    PathBuilder<?> pathBuilder = new PathBuilder(path.getType(), path.getMetadata());
                    String property = order.getProperty();
                    Order orderType = order.isAscending() ? Order.ASC : Order.DESC;

                    if (property.contains(".")) {
                        String[] parts = property.split("\\.");
                        Path<?> entityPath = pathBuilder;

                        for (String part : parts) {
                            entityPath = ((PathBuilder) entityPath).get(part);
                        }

                        return new OrderSpecifier(orderType, entityPath);
                    } else {
                        return new OrderSpecifier(orderType, pathBuilder.get(property));
                    }
                })
                .toArray(OrderSpecifier[]::new);
    }
}
