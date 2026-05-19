package com.domussmart.dto;

public record LoginResponseDTO(String token, String email, String role, Long condominioId, String condominioNome, Long userId) {
}
