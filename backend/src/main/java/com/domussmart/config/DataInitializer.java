package com.domussmart.config;

import com.domussmart.model.Usuario;
import com.domussmart.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "admin@domusmart.com";
        if (usuarioRepository.findByEmail(adminEmail).isEmpty()) {
            Usuario admin = new Usuario();
            admin.setEmail(adminEmail);
            admin.setSenha(passwordEncoder.encode("admin123"));
            admin.setRole(Usuario.Role.ADMIN);
            usuarioRepository.save(admin);
            System.out.println("=================================================");
            System.out.println("Super Admin criado com sucesso!");
            System.out.println("Email: " + adminEmail);
            System.out.println("Senha: admin123");
            System.out.println("=================================================");
        }
    }
}
