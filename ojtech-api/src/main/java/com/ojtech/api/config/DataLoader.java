package com.ojtech.api.config;

import com.ojtech.api.model.ERole;
import com.ojtech.api.model.Role;
import com.ojtech.api.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements ApplicationRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (roleRepository.findByName(ERole.ROLE_STUDENT).isEmpty()) {
            roleRepository.save(new Role(ERole.ROLE_STUDENT));
        }
        if (roleRepository.findByName(ERole.ROLE_EMPLOYER).isEmpty()) {
            roleRepository.save(new Role(ERole.ROLE_EMPLOYER));
        }
        if (roleRepository.findByName(ERole.ROLE_ADMIN).isEmpty()) {
            roleRepository.save(new Role(ERole.ROLE_ADMIN));
        }
    }
}
