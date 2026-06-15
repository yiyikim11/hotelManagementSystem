package hotelpms.pms.report.controller;

import hotelpms.pms.report.dto.DashboardResponse;
import hotelpms.pms.report.dto.OccupancyResponse;
import hotelpms.pms.report.dto.RevenueResponse;
import hotelpms.pms.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/pms/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> dashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getDashboard(date != null ? date : LocalDate.now()));
    }

    @GetMapping("/occupancy")
    public ResponseEntity<List<OccupancyResponse>> occupancy(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.getOccupancy(from, to));
    }

    @GetMapping("/revenue")
    public ResponseEntity<RevenueResponse> revenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(reportService.getRevenue(from, to));
    }
}
