package handlers

import (
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"strings"
)

func SaveImage(image multipart.File, header *multipart.FileHeader, path string) (string, error) {
	defer image.Close()
	slice := strings.Split(header.Filename, ".")
	if len(slice) != 2 || !isValidImageExtension(slice[1]) {
		return "", http.ErrMissingFile
	} else if header.Size > 1024*1024*20 {
		return "", http.ErrMissingFile
	}

	if err := os.MkdirAll(path, os.ModePerm); err != nil {
		return "", err
	}

	imagePath := path + header.Filename
	out, err := os.Create(imagePath)
	if err != nil {
		return "", err
	}
	defer out.Close()

	_, err = io.Copy(out, image)
	if err != nil {
		return "", err
	}

	return imagePath, nil
}

func isValidImageExtension(ext string) bool {
	allowedExtensions := []string{"png", "jpeg", "gif", "bmp", "svg", "raw", "tiff", "webp", "jpg"}
	for _, allowed := range allowedExtensions {
		if ext == allowed {
			return true
		}
	}
	return false
}
