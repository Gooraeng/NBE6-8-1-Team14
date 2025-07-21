package com.back.domain.order.dto.response;


import com.back.domain.order.entity.Order;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;


@Builder
public record OrderResponseDto (
    Long orderId,
    String memberName,
    String address,
    int totalPrice,
    int totalCount,
    LocalDateTime createdAt,
    String deliveryStatus,
    List<OrderItemResponseDto> orderItems

) {
    public static OrderResponseDto from(Order order, List<OrderItemResponseDto> orderItems) {
        String deliveryStatus = order.getDelivery() != null ? order.getDelivery().getStatus().toString() : "";

        return OrderResponseDto.builder()
            .orderId(order.getId())
            .memberName(order.getMember().getNickname())
            .address(order.getAddress())
            .totalPrice(order.getTotalPrice())
            .totalCount(order.getTotalCount())
            .createdAt(order.getCreatedAt())
            .orderItems(orderItems)
            .deliveryStatus(deliveryStatus)
            .build();
    }

    public static OrderResponseDto from(Order order) {
        String deliveryStatus = order.getDelivery() != null ? order.getDelivery().getStatus().toString() : "";

        return OrderResponseDto.builder()
            .orderId(order.getId())
            .memberName(order.getMember().getNickname())
            .address(order.getAddress())
            .totalPrice(order.getTotalPrice())
            .totalCount(order.getTotalCount())
            .createdAt(LocalDateTime.now())
            .orderItems(order.getOrderItems().stream()
                .map(OrderItemResponseDto::from)
                .toList())
            .deliveryStatus(deliveryStatus)
            .build();
    }
}
