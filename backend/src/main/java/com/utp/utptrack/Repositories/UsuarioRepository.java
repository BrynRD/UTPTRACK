package com.utp.utptrack.Repositories;

import com.utp.utptrack.Models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {
    Usuario findByUsername(String username);
    Usuario findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}