package hotelpms.pms.cancellationpolicy.service;

import hotelpms.common.exception.ConflictException;
import hotelpms.common.exception.NotFoundException;
import hotelpms.pms.cancellationpolicy.dto.CancellationPolicyRequest;
import hotelpms.pms.cancellationpolicy.dto.CancellationPolicyResponse;
import hotelpms.pms.cancellationpolicy.entity.CancellationPolicy;
import hotelpms.pms.cancellationpolicy.repository.CancellationPolicyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CancellationPolicyService {

    private final CancellationPolicyRepository repository;

    public Page<CancellationPolicyResponse> list(Pageable pageable) {
        return repository.findAll(pageable).map(CancellationPolicyResponse::from);
    }

    public CancellationPolicyResponse findById(UUID id) {
        return CancellationPolicyResponse.from(get(id));
    }

    @Transactional
    public CancellationPolicyResponse create(CancellationPolicyRequest req) {
        if (repository.existsByCode(req.code())) {
            throw new ConflictException("Cancellation policy code already exists: " + req.code());
        }
        CancellationPolicy policy = new CancellationPolicy();
        apply(policy, req);
        return CancellationPolicyResponse.from(repository.save(policy));
    }

    @Transactional
    public CancellationPolicyResponse update(UUID id, CancellationPolicyRequest req) {
        CancellationPolicy policy = get(id);
        if (!policy.getCode().equals(req.code()) && repository.existsByCode(req.code())) {
            throw new ConflictException("Cancellation policy code already exists: " + req.code());
        }
        apply(policy, req);
        return CancellationPolicyResponse.from(repository.save(policy));
    }

    @Transactional
    public void delete(UUID id) {
        repository.delete(get(id));
    }

    private CancellationPolicy get(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> NotFoundException.of("CancellationPolicy", id));
    }

    private void apply(CancellationPolicy p, CancellationPolicyRequest req) {
        p.setCode(req.code());
        p.setName(req.name());
        p.setDescription(req.description());
        p.setHoursBeforeArrival(req.hoursBeforeArrival());
        p.setFeeType(req.feeType());
        p.setFeeValue(req.feeValue());
        p.setActive(req.isActive());
    }
}
