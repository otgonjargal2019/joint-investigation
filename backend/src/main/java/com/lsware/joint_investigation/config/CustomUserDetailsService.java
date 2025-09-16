package com.lsware.joint_investigation.config;

import java.util.ArrayList;
import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.lsware.joint_investigation.config.customException.AdminNotCommittedException;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        Users user = userRepository.findByLoginId(loginId)
                .map(u -> {
                    if (u.getStatus() == Users.USER_STATUS.PENDING) {
                        throw new AdminNotCommittedException("ADMIN_CONFIRMATION_NEEDED");
                    }
                    return u;
                })
                .orElseThrow(() -> new UsernameNotFoundException("LoginID not found"));

        // Create authorities collection with ROLE_ prefix
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        String role = user.getRole().name();
        if (role != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role));
        }

        return new CustomUser(user.getUserId(), user.getPasswordHash(), authorities);
    }
}
