package hotelpms.pms.rateplan.service;

import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.pms.rateplan.dto.DailyRoomRateRequest;
import hotelpms.pms.rateplan.dto.DailyRoomRateResponse;
import hotelpms.pms.rateplan.dto.RatePlanRequest;
import hotelpms.pms.rateplan.dto.RatePlanResponse;
import hotelpms.pms.rateplan.entity.DailyRoomRate;
import hotelpms.pms.rateplan.entity.RatePlan;
import hotelpms.pms.rateplan.repository.DailyRoomRateRepository;
import hotelpms.pms.rateplan.repository.RatePlanRepository;
import hotelpms.pms.room.entity.RoomType;
import hotelpms.pms.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RatePlanService {

    private final RatePlanRepository ratePlanRepository;
    private final DailyRoomRateRepository dailyRoomRateRepository;
    private final RoomTypeRepository roomTypeRepository;

    public Page<RatePlanResponse> list(Pageable pageable) {
        return ratePlanRepository.findAll(pageable).map(RatePlanResponse::from);
    }

    public RatePlanResponse findById(UUID id) {
        return RatePlanResponse.from(getRatePlan(id));
    }

    @Transactional
    public RatePlanResponse create(RatePlanRequest req) {
        if (ratePlanRepository.existsByCode(req.code())) {
            throw new ConflictException("Rate plan code already exists: " + req.code());
        }
        RatePlan plan = new RatePlan();
        applyRequest(plan, req);
        return RatePlanResponse.from(ratePlanRepository.save(plan));
    }

    @Transactional
    public RatePlanResponse update(UUID id, RatePlanRequest req) {
        RatePlan plan = getRatePlan(id);
        if (!plan.getCode().equals(req.code()) && ratePlanRepository.existsByCode(req.code())) {
            throw new ConflictException("Rate plan code already exists: " + req.code());
        }
        applyRequest(plan, req);
        return RatePlanResponse.from(ratePlanRepository.save(plan));
    }

    @Transactional
    public void delete(UUID id) {
        RatePlan plan = getRatePlan(id);
        ratePlanRepository.delete(plan);
    }

    public List<DailyRoomRateResponse> getRates(UUID ratePlanId, UUID roomTypeId, LocalDate from, LocalDate to) {
        return dailyRoomRateRepository
                .findByRatePlanAndRoomTypeAndDateRange(ratePlanId, roomTypeId, from, to)
                .stream().map(DailyRoomRateResponse::from).toList();
    }

    @Transactional
    public DailyRoomRateResponse upsertRate(DailyRoomRateRequest req) {
        RatePlan plan = getRatePlan(req.ratePlanId());
        RoomType roomType = roomTypeRepository.findById(req.roomTypeId())
                .orElseThrow(() -> NotFoundException.of("RoomType", req.roomTypeId()));

        DailyRoomRate rate = dailyRoomRateRepository
                .findByRatePlanIdAndRoomTypeIdAndRateDate(req.ratePlanId(), req.roomTypeId(), req.rateDate())
                .orElseGet(DailyRoomRate::new);

        rate.setRatePlan(plan);
        rate.setRoomType(roomType);
        rate.setRateDate(req.rateDate());
        rate.setRate(req.rate());
        return DailyRoomRateResponse.from(dailyRoomRateRepository.save(rate));
    }

    @Transactional
    public List<DailyRoomRateResponse> bulkUpsertRates(List<DailyRoomRateRequest> requests) {
        return requests.stream().map(this::upsertRate).toList();
    }

    private RatePlan getRatePlan(UUID id) {
        return ratePlanRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("RatePlan", id));
    }

    private void applyRequest(RatePlan plan, RatePlanRequest req) {
        plan.setCode(req.code());
        plan.setName(req.name());
        plan.setDescription(req.description());
        plan.setActive(req.isActive());
    }
}
