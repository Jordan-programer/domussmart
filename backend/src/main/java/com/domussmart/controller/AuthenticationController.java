package com.domussmart.controller;

import com.domussmart.dto.AuthenticationDTO;
import com.domussmart.dto.LoginResponseDTO;
import com.domussmart.dto.RegisterDTO;
import com.domussmart.model.Usuario;
import com.domussmart.repository.MoradorRepository;
import com.domussmart.repository.UsuarioRepository;
import com.domussmart.repository.CondominioRepository;
import com.domussmart.security.TokenService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MoradorRepository moradorRepository;

    @Autowired
    private CondominioRepository condominioRepository;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(@RequestBody AuthenticationDTO data) {
        var usernamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.senha());
        var auth = this.authenticationManager.authenticate(usernamePassword);

        Usuario usuario = (Usuario) auth.getPrincipal();
        var token = tokenService.gerarToken(usuario);

        Long condominioId = usuario.getCondominio() != null ? usuario.getCondominio().getId() : null;
        String condominioNome = usuario.getCondominio() != null ? usuario.getCondominio().getNome() : null;
        Long moradorId = usuario.getMorador() != null ? usuario.getMorador().getId() : null;
        Long unidadeId = (usuario.getMorador() != null && usuario.getMorador().getUnidade() != null) 
                ? usuario.getMorador().getUnidade().getId() : null;

        return ResponseEntity.ok(new LoginResponseDTO(
            token, 
            usuario.getEmail(), 
            usuario.getRole().name(), 
            condominioId, 
            condominioNome, 
            usuario.getId(), 
            moradorId, 
            unidadeId
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterDTO data) {
        if (this.usuarioRepository.findByEmail(data.email()).isPresent()) {
            return ResponseEntity.badRequest().build();
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.senha());
        Usuario newUser = new Usuario();
        newUser.setEmail(data.email());
        newUser.setSenha(encryptedPassword);
        newUser.setRole(data.role());
        
        if (data.moradorId() != null) {
            moradorRepository.findById(data.moradorId()).ifPresent(newUser::setMorador);
        }

        if (data.condominioId() != null) {
            condominioRepository.findById(data.condominioId()).ifPresent(newUser::setCondominio);
        }
        
        this.usuarioRepository.save(newUser);

        return ResponseEntity.ok().build();
    }

    public record MoradorSelfRegisterDTO(String email, String nif, String senha) {}

    @PostMapping("/morador/register")
    public ResponseEntity<?> registrarMorador(@RequestBody MoradorSelfRegisterDTO data) {
        if (data.email() == null || data.email().isBlank() ||
            data.nif() == null || data.nif().isBlank() ||
            data.senha() == null || data.senha().isBlank()) {
            return ResponseEntity.badRequest().body("Todos os campos (e-mail, NIF e senha) são obrigatórios.");
        }

        if (usuarioRepository.findByEmail(data.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Este e-mail já possui um usuário cadastrado no sistema.");
        }

        var moradorOpt = moradorRepository.findByEmailAndNif(data.email(), data.nif());
        if (moradorOpt.isEmpty()) {
            return ResponseEntity.status(404).body("Morador não pré-cadastrado no condomínio com este e-mail e NIF. Por favor, verifique os seus dados ou fale com o síndico.");
        }

        var morador = moradorOpt.get();

        if (usuarioRepository.findByMoradorId(morador.getId()).isPresent()) {
            return ResponseEntity.badRequest().body("Este morador já possui um usuário de login ativo no sistema.");
        }

        String encryptedPassword = new BCryptPasswordEncoder().encode(data.senha());
        Usuario newUser = new Usuario();
        newUser.setEmail(data.email());
        newUser.setSenha(encryptedPassword);
        newUser.setRole(Usuario.Role.MORADOR);
        newUser.setMorador(morador);

        if (morador.getUnidade() != null && morador.getUnidade().getBloco() != null &&
            morador.getUnidade().getBloco().getCondominio() != null) {
            newUser.setCondominio(morador.getUnidade().getBloco().getCondominio());
        }

        usuarioRepository.save(newUser);

        var token = tokenService.gerarToken(newUser);
        Long condominioId = newUser.getCondominio() != null ? newUser.getCondominio().getId() : null;
        String condominioNome = newUser.getCondominio() != null ? newUser.getCondominio().getNome() : null;
        Long unidadeId = morador.getUnidade() != null ? morador.getUnidade().getId() : null;

        return ResponseEntity.ok(new LoginResponseDTO(
            token,
            newUser.getEmail(),
            newUser.getRole().name(),
            condominioId,
            condominioNome,
            newUser.getId(),
            morador.getId(),
            unidadeId
        ));
    }
}
