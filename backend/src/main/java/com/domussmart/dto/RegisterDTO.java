package com.domussmart.dto;

import com.domussmart.model.Usuario.Role;

public record RegisterDTO(String email, String senha, Role role, Long moradorId, Long condominioId) {
}
