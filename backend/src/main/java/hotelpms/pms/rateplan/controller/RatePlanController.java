package hotelpms.pms.rateplan.controller;

import hotelpms.pms.rateplan.dto.DailyRoomRateRequest;
import hotelpms.pms.rateplan.dto.DailyRoomRateResponse;
import hotelpms.pms.rateplan.dto.RatePlanRequest;
import hotelpms.pms.rateplan.dto.RatePlanResponse;
import hotelpms.pms.rateplan.service.RatePlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pms/rate-plans")
@RequiredArgsConstructor
public class RatePlanController {

    private final RatePlanService ratePlanService;

    @GetMapping
    public ResponseEntity<Page<RatePlanResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(ratePlanService.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RatePlanResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(ratePlanService.findById(id));
    }

    @PostMapping
    public ResponseEntity<RatePlanResponse> create(@Valid @RequestBody RatePlanRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ratePlanService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RatePlanResponse> update(@PathVariable UUID id,
                                                   @Valid @RequestBody RatePlanRequest request) {
        return ResponseEntity.ok(ratePlanService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ratePlanService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/rates")
    public ResponseEntity<List<DailyRoomRateResponse>> getRates(
            @PathVariable UUID id,
            @RequestParam UUID roomTypeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(ratePlanService.getRates(id, roomTypeId, from, to));
    }

    @PostMapping("/rates")
    public ResponseEntity<DailyRoomRateResponse> upsertRate(
            @Valid @RequestBody DailyRoomRateRequest request) {
        return ResponseEntity.ok(ratePlanService.upsertRate(request));
    }

    @PostMapping("/rates/bulk")
    public ResponseEntity<List<DailyRoomRateResponse>> bulkUpsertRates(
            @RequestBody List<@Valid DailyRoomRateRequest> requests) {
        return ResponseEntity.ok(ratePlanService.bulkUpsertRates(requests));
    }
}
