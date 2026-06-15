package hotelpms.pms.guest.service;

import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.pms.guest.dto.GuestRequest;
import hotelpms.pms.guest.dto.GuestResponse;
import hotelpms.pms.guest.entity.Guest;
import hotelpms.pms.guest.repository.GuestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GuestService {

    private final GuestRepository guestRepository;

    public Page<GuestResponse> list(Pageable pageable) {
        return guestRepository.findAllActive(pageable).map(GuestResponse::from);
    }

    public Page<GuestResponse> search(String query, Pageable pageable) {
        if (!StringUtils.hasText(query)) {
            return guestRepository.findAllActive(pageable).map(GuestResponse::from);
        }
        return guestRepository.search(query.trim(), pageable).map(GuestResponse::from);
    }

    public GuestResponse findById(UUID id) {
        return GuestResponse.from(getActive(id));
    }

    @Transactional
    public GuestResponse create(GuestRequest req) {
        if (guestRepository.existsByEmail(req.email())) {
            throw new ConflictException("Guest with email already exists: " + req.email());
        }
        Guest guest = new Guest();
        applyRequest(guest, req);
        return GuestResponse.from(guestRepository.save(guest));
    }

    @Transactional
    public GuestResponse update(UUID id, GuestRequest req) {
        Guest guest = getActive(id);
        if (!guest.getEmail().equals(req.email()) && guestRepository.existsByEmail(req.email())) {
            throw new ConflictException("Guest with email already exists: " + req.email());
        }
        applyRequest(guest, req);
        return GuestResponse.from(guestRepository.save(guest));
    }

    @Transactional
    public void delete(UUID id) {
        Guest guest = getActive(id);
        guest.setDeletedAt(Instant.now());
        guestRepository.save(guest);
    }

    private Guest getActive(UUID id) {
        Guest guest = guestRepository.findById(id)
                .orElseThrow(() -> NotFoundException.of("Guest", id));
        if (guest.getDeletedAt() != null) {
            throw NotFoundException.of("Guest", id);
        }
        return guest;
    }

    private void applyRequest(Guest g, GuestRequest req) {
        g.setFirstName(req.firstName());
        g.setLastName(req.lastName());
        g.setEmail(req.email());
        g.setPhone(req.phone());
        g.setDateOfBirth(req.dateOfBirth());
        g.setGender(req.gender());
        g.setAddress(req.address());
        g.setNationality(req.nationality());
        g.setIdType(req.idType());
        g.setIdNumber(req.idNumber());
        g.setIssuingCountry(req.issuingCountry());
        g.setIdDocumentImage(req.idDocumentImage());
        g.setPreferences(req.preferences());
        g.setVipStatus(req.vipStatus());
        g.setBlacklisted(req.blacklisted());
    }
}
