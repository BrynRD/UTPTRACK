package com.utp.utptrack.Repositories;

import com.utp.utptrack.Models.Rol;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RolRepository extends CrudRepository<Rol, Long> {

    /**
     * Busca un rol por su nombre exacto
     * @param nombre El nombre del rol (ej. "ROLE_ADMIN")
     * @return El rol si existe, o null si no existe
     */
    Rol findByNombre(String nombre);
}