package hotelpms.pms.report.service;

import hotelpms.pms.folio.entity.ChargeType;
import hotelpms.pms.folio.repository.FolioItemRepository;
import hotelpms.pms.folio.repository.FolioRepository;
import hotelpms.pms.report.dto.DashboardResponse;
import hotelpms.pms.report.dto.OccupancyResponse;
import hotelpms.pms.report.dto.RevenueResponse;
import hotelpms.pms.reservation.entity.ReservationStatus;
import hotelpms.pms.reservation.repository.ReservationRepository;
import hotelpms.pms.room.entity.RoomStatus;
import hotelpms.pms.room.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final FolioRepository folioRepository;
    private final FolioItemRepository folioItemRepository;

    public DashboardResponse getDashboard(LocalDate date) {
        long totalRooms = roomRepository.count();
        long occupiedRooms = roomRepository.countByStatus(RoomStatus.OCCUPIED);
        long availableRooms = roomRepository.countByStatus(RoomStatus.AVAILABLE);
        long arrivalsToday = reservationRepository.countArrivalsForDate(date);
        long departuresToday = reservationRepository.countDeparturesForDate(date);
        long inHouseGuests = reservationRepository.countInHouseForDate(date);
        long confirmedReservations = reservationRepository.countByStatus(ReservationStatus.CONFIRMED);
        BigDecimal revenueToday = nullSafe(folioItemRepository.sumChargesByDate(date));
        return new DashboardResponse(totalRooms, availableRooms, occupiedRooms,
                arrivalsToday, departuresToday, inHouseGuests, confirmedReservations, revenueToday);
    }

    public List<OccupancyResponse> getOccupancy(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("'from' date must not be after 'to' date");
        }
        long totalRooms = roomRepository.count();
        List<OccupancyResponse> result = new ArrayList<>();
        for (LocalDate date = from; !date.isAfter(to); date = date.plusDays(1)) {
            long occupied = reservationRepository.countInHouseForDate(date);
            double rate = totalRooms > 0
                    ? BigDecimal.valueOf(occupied * 100.0 / totalRooms)
                            .setScale(2, RoundingMode.HALF_UP).doubleValue()
                    : 0.0;
            result.add(new OccupancyResponse(date, totalRooms, occupied, rate));
        }
        return result;
    }

    public RevenueResponse getRevenue(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException("'from' date must not be after 'to' date");
        }
        BigDecimal totalRevenue = nullSafe(folioItemRepository.sumChargesByDateRange(from, to));
        BigDecimal roomRevenue = nullSafe(
                folioItemRepository.sumChargesByTypeAndDateRange(ChargeType.ROOM.name(), from, to));
        BigDecimal otherRevenue = totalRevenue.subtract(roomRevenue);
        long totalFolios = folioRepository.countByDateRange(from, to);
        return new RevenueResponse(from, to, totalRevenue, roomRevenue, otherRevenue, totalFolios);
    }

    private BigDecimal nullSafe(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }
}
