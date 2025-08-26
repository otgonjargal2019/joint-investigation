package com.lsware.joint_investigation.config;

import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

//import com.lsware.joint_investigation.user.entity.Role;
import com.lsware.joint_investigation.user.entity.Users;
import com.lsware.joint_investigation.user.repository.UserRepository;

// import java.util.Collection;
// import java.util.List;
// import java.util.stream.Collectors;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String loginId) throws UsernameNotFoundException {
        // Users user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Email not found"));
        // return new CustomUser(user.getUserId(), user.getEmail(), user.getPasswordHash(), new ArrayList<>());

        Users user = userRepository.findByLoginId(loginId).orElseThrow(() -> new UsernameNotFoundException("LoginID not found"));
        return new CustomUser(user.getUserId(), user.getEmail(), user.getPasswordHash(), new ArrayList<>(), user.getRole().name());
    }

    // private Collection<GrantedAuthority> mapRolesToAuthorities(List<Role> roles) {
    //     return roles.stream().map(role -> new SimpleGrantedAuthority(role.getName().toString())).collect(Collectors.toList());
    // }
}
