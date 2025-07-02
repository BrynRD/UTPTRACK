package com.utp.utptrack.Services;

import com.utp.utptrack.Models.Usuario;
import com.utp.utptrack.Repositories.UsuarioRepository;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.qrcode.QRCodeWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import com.warrenstrange.googleauth.GoogleAuthenticatorKey;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import javax.imageio.ImageIO;

@Service
public class ServicioAutenticacionDosFactores {

    private final GoogleAuthenticator googleAuthenticator;
    private final UsuarioRepository usuarioRepository;

    public ServicioAutenticacionDosFactores(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
        this.googleAuthenticator = new GoogleAuthenticator();
    }

    public String generarSecretoNuevo() {
        GoogleAuthenticatorKey key = googleAuthenticator.createCredentials();
        return key.getKey();
    }

    // Modificado para aceptar Integer en lugar de int
    public boolean verificarCodigo(String secreto, Integer codigo) {
        return googleAuthenticator.authorize(secreto, codigo);
    }

    public String generarUrlQR(String secreto, String usuario, String issuer) {
        return "otpauth://totp/" + issuer + ":" + usuario + "?secret=" + secreto + "&issuer=" + issuer;
    }

    public byte[] generarImagenQR(String secreto, String usuario) {
        try {
            String issuer = "UTPEgresados";
            String otpauthUrl = generarUrlQR(secreto, usuario, issuer);

            QRCodeWriter qrCodeWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrCodeWriter.encode(otpauthUrl, BarcodeFormat.QR_CODE, 200, 200);

            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar código QR", e);
        }
    }

    // Ya modificado para aceptar Long
    public void activar2FA(String userId, String secreto) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        usuario.setSecreto2fa(secreto);
        usuario.setActivado2fa(true);
        usuarioRepository.save(usuario);
    }

    // Ya modificado para aceptar Long
    public void desactivar2FA(String userId) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));

        usuario.setSecreto2fa(null);
        usuario.setActivado2fa(false);
        usuarioRepository.save(usuario);
    }
}