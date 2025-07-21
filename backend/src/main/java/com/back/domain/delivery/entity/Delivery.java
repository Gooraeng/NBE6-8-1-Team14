package com.back.domain.delivery.entity;


import com.back.domain.delivery.enums.DeliveryStatus;
import com.back.domain.member.entity.Member;
import com.back.domain.order.entity.Order;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = lombok.AccessLevel.PROTECTED)
@Table(name = "delivery")
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "delivery_id")
    private Long id;

    @Column(name = "delivery_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private DeliveryStatus status;

    @Column(name = "delivery_tracking_number", nullable = false)
    private String trackingNumber;

    @Column(name = "delivery_shipping_date")
    private LocalDateTime shippingDate;

    @OneToMany(mappedBy = "delivery")
    private List<Order> orders = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;


    @Builder
    public Delivery(DeliveryStatus status, String trackingNumber, LocalDateTime shippingDate, List<Order> orders) {
        this.status = status;
        this.trackingNumber = trackingNumber;
        this.shippingDate = shippingDate;
        this.orders = orders;
    }

    public void addOrder(Order order) {
        if (orders != null) {
            orders.add(order);
        }
        order.setDelivery(this);
    }

    public void updateStatus(DeliveryStatus deliveryStatus) {
        this.status = deliveryStatus;
    }

    public void updateShippingDate(LocalDateTime now) {
        this.shippingDate = now;
    }

    public void setMember(Member member) {
        this.member = member;
    }
}
