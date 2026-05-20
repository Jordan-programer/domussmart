package com.domussmart.controller;

import com.domussmart.model.Usuario;
import com.domussmart.repository.UsuarioRepository;
import com.domussmart.repository.MoradorRepository;
import com.domussmart.repository.CondominioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MoradorRepository moradorRepository;

    @Autowired
    private CondominioRepository condominioRepository;

    public record UsuarioResponseDTO(
            Long id,
            String email,
            String role,
            String nome,
            String telefone,
            String nif,
            String condominioNome,
            Long condominioId,
            Long moradorId,
            Long unidadeId
    ) {}

    public record UpdateProfileDTO(String email) {}

    public record ChangePasswordDTO(String senhaAtual, String novaSenha) {}

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> getProfile() {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario freshUsuario = usuarioRepository.findById(usuario.getId()).orElse(usuario);
        
        String nome = "Administrador";
        String telefone = "-";
        String nif = "-";
        if (freshUsuario.getMorador() != null) {
            nome = freshUsuario.getMorador().getNome();
            telefone = freshUsuario.getMorador().getTelefone();
            nif = freshUsuario.getMorador().getNif();
        }
        
        String condominioNome = freshUsuario.getCondominio() != null ? freshUsuario.getCondominio().getNome() : "Sem Condomínio";

        Long moradorId = freshUsuario.getMorador() != null ? freshUsuario.getMorador().getId() : null;
        Long unidadeId = (freshUsuario.getMorador() != null && freshUsuario.getMorador().getUnidade() != null) 
                ? freshUsuario.getMorador().getUnidade().getId() : null;

        UsuarioResponseDTO response = new UsuarioResponseDTO(
                freshUsuario.getId(),
                freshUsuario.getEmail(),
                freshUsuario.getRole().name(),
                nome,
                telefone,
                nif,
                condominioNome,
                freshUsuario.getCondominio() != null ? freshUsuario.getCondominio().getId() : null,
                moradorId,
                unidadeId
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UsuarioResponseDTO> updateProfile(@RequestBody UpdateProfileDTO data) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario freshUsuario = usuarioRepository.findById(usuario.getId()).orElseThrow();

        if (data.email() != null && !data.email().isBlank()) {
            var existing = usuarioRepository.findByEmail(data.email());
            if (existing.isPresent() && !existing.get().getId().equals(freshUsuario.getId())) {
                return ResponseEntity.badRequest().build();
            }
            freshUsuario.setEmail(data.email());
        }

        usuarioRepository.save(freshUsuario);
        return getProfile();
    }

    @PutMapping("/me/senha")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordDTO data) {
        Usuario usuario = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        Usuario freshUsuario = usuarioRepository.findById(usuario.getId()).orElseThrow();

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        if (!encoder.matches(data.senhaAtual(), freshUsuario.getSenha())) {
            return ResponseEntity.badRequest().build();
        }

        String encryptedPassword = encoder.encode(data.novaSenha());
        freshUsuario.setSenha(encryptedPassword);
        usuarioRepository.save(freshUsuario);

        return ResponseEntity.ok().build();
    }

    public record CreateUsuarioDTO(
        String email,
        String senha,
        String role,
        Long moradorId
    ) {}

    public record UpdateUsuarioDTO(
        String email,
        String senha,
        String role,
        Long moradorId
    ) {}

    @GetMapping
    public ResponseEntity<List<UsuarioResponseDTO>> getUsuarios() {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() != Usuario.Role.ADMIN && loggedUser.getRole() != Usuario.Role.SINDICO) {
            return ResponseEntity.status(403).build();
        }
        
        Long condominioId = loggedUser.getCondominio() != null ? loggedUser.getCondominio().getId() : null;
        if (condominioId == null) {
            return ResponseEntity.ok(List.of());
        }
        
        List<Usuario> list = usuarioRepository.findByCondominioId(condominioId);
        List<UsuarioResponseDTO> dtoList = list.stream().map(u -> {
            String nome = u.getRole() == Usuario.Role.SINDICO ? "Síndico" : (u.getRole() == Usuario.Role.PORTEIRO ? "Porteiro" : "Morador");
            String telefone = "-";
            String nif = "-";
            if (u.getMorador() != null) {
                nome = u.getMorador().getNome();
                telefone = u.getMorador().getTelefone();
                nif = u.getMorador().getNif();
            }
            String condoNome = u.getCondominio() != null ? u.getCondominio().getNome() : "Sem Condomínio";
            
            Long moradorId = u.getMorador() != null ? u.getMorador().getId() : null;
            Long unidadeId = (u.getMorador() != null && u.getMorador().getUnidade() != null) 
                    ? u.getMorador().getUnidade().getId() : null;
            
            return new UsuarioResponseDTO(
                u.getId(),
                u.getEmail(),
                u.getRole().name(),
                nome,
                telefone,
                nif,
                condoNome,
                u.getCondominio() != null ? u.getCondominio().getId() : null,
                moradorId,
                unidadeId
            );
        }).toList();
        
        return ResponseEntity.ok(dtoList);
    }

    @PostMapping
    public ResponseEntity<UsuarioResponseDTO> createUsuario(@RequestBody CreateUsuarioDTO data) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() != Usuario.Role.ADMIN && loggedUser.getRole() != Usuario.Role.SINDICO) {
            return ResponseEntity.status(403).build();
        }
        
        if (usuarioRepository.findByEmail(data.email()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }
        
        Usuario newUser = new Usuario();
        newUser.setEmail(data.email());
        newUser.setSenha(new BCryptPasswordEncoder().encode(data.senha()));
        
        try {
            newUser.setRole(Usuario.Role.valueOf(data.role().toUpperCase()));
        } catch (Exception e) {
            newUser.setRole(Usuario.Role.PORTEIRO); // default
        }
        
        newUser.setCondominio(loggedUser.getCondominio());
        
        if (data.moradorId() != null) {
            moradorRepository.findById(data.moradorId()).ifPresent(newUser::setMorador);
        }
        
        usuarioRepository.save(newUser);
        
        String nome = newUser.getRole() == Usuario.Role.SINDICO ? "Síndico" : (newUser.getRole() == Usuario.Role.PORTEIRO ? "Porteiro" : "Morador");
        String telefone = "-";
        String nif = "-";
        if (newUser.getMorador() != null) {
            nome = newUser.getMorador().getNome();
            telefone = newUser.getMorador().getTelefone();
            nif = newUser.getMorador().getNif();
        }
        String condoNome = newUser.getCondominio() != null ? newUser.getCondominio().getNome() : "Sem Condomínio";
        
        Long moradorId = newUser.getMorador() != null ? newUser.getMorador().getId() : null;
        Long unidadeId = (newUser.getMorador() != null && newUser.getMorador().getUnidade() != null) 
                ? newUser.getMorador().getUnidade().getId() : null;
        
        return ResponseEntity.ok(new UsuarioResponseDTO(
            newUser.getId(),
            newUser.getEmail(),
            newUser.getRole().name(),
            nome,
            telefone,
            nif,
            condoNome,
            newUser.getCondominio() != null ? newUser.getCondominio().getId() : null,
            moradorId,
            unidadeId
        ));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponseDTO> updateUsuario(@PathVariable Long id, @RequestBody UpdateUsuarioDTO data) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() != Usuario.Role.ADMIN && loggedUser.getRole() != Usuario.Role.SINDICO) {
            return ResponseEntity.status(403).build();
        }
        
        Usuario user = usuarioRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        if (loggedUser.getRole() != Usuario.Role.ADMIN) {
            if (user.getCondominio() == null || loggedUser.getCondominio() == null ||
                !user.getCondominio().getId().equals(loggedUser.getCondominio().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        
        if (data.email() != null && !data.email().isBlank()) {
            var existing = usuarioRepository.findByEmail(data.email());
            if (existing.isPresent() && !existing.get().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().build();
            }
            user.setEmail(data.email());
        }
        
        if (data.senha() != null && !data.senha().isBlank()) {
            user.setSenha(new BCryptPasswordEncoder().encode(data.senha()));
        }
        
        if (data.role() != null) {
            try {
                user.setRole(Usuario.Role.valueOf(data.role().toUpperCase()));
            } catch (Exception e) {}
        }
        
        if (data.moradorId() != null) {
            moradorRepository.findById(data.moradorId()).ifPresent(user::setMorador);
        } else {
            user.setMorador(null);
        }
        
        usuarioRepository.save(user);
        
        String nome = user.getRole() == Usuario.Role.SINDICO ? "Síndico" : (user.getRole() == Usuario.Role.PORTEIRO ? "Porteiro" : "Morador");
        String telefone = "-";
        String nif = "-";
        if (user.getMorador() != null) {
            nome = user.getMorador().getNome();
            telefone = user.getMorador().getTelefone();
            nif = user.getMorador().getNif();
        }
        String condoNome = user.getCondominio() != null ? user.getCondominio().getNome() : "Sem Condomínio";
        
        Long moradorId = user.getMorador() != null ? user.getMorador().getId() : null;
        Long unidadeId = (user.getMorador() != null && user.getMorador().getUnidade() != null) 
                ? user.getMorador().getUnidade().getId() : null;
        
        return ResponseEntity.ok(new UsuarioResponseDTO(
            user.getId(),
            user.getEmail(),
            user.getRole().name(),
            nome,
            telefone,
            nif,
            condoNome,
            user.getCondominio() != null ? user.getCondominio().getId() : null,
            moradorId,
            unidadeId
        ));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id) {
        Usuario loggedUser = (Usuario) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (loggedUser.getRole() != Usuario.Role.ADMIN && loggedUser.getRole() != Usuario.Role.SINDICO) {
            return ResponseEntity.status(403).build();
        }
        
        Usuario user = usuarioRepository.findById(id).orElse(null);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        if (loggedUser.getRole() != Usuario.Role.ADMIN) {
            if (user.getCondominio() == null || loggedUser.getCondominio() == null ||
                !user.getCondominio().getId().equals(loggedUser.getCondominio().getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        
        if (user.getId().equals(loggedUser.getId())) {
            return ResponseEntity.badRequest().build();
        }
        
        usuarioRepository.delete(user);
        return ResponseEntity.ok().build();
    }
}
