package com.otres.hotelpms.pms.reservation.service;

import com.otres.hotelpms.pms.reservation.dto.CreateReservationRequest;
import com.otres.hotelpms.pms.reservation.dto.ReservationResponse;
import com.otres.hotelpms.pms.reservation.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public ReservationResponse create(CreateReservationRequest request) {
        throw new UnsupportedOperationException("not implemented");
    }

    @Transactional(readOnly = true)
    public ReservationResponse findById(UUID id) {
        throw new UnsupportedOperationException("not implemented");
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> list() {
        throw new UnsupportedOperationException("not implemented");
    }
}
