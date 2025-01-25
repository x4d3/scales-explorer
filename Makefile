# FTP server details
FTP_HOST := $(FTP_HOST)
FTP_DIR := /xade/scales-explorer/
FTP_USER := $(FTP_USERNAME)
FTP_PASS := $(FTP_PASSWORD)

# Files to upload
FILES := index.html main.js simple.css vexflow@4.2.3.js preview.png

.PHONY: upload
upload:
	@echo "Uploading files to $(FTP_HOST)$(FTP_DIR)"
	@for file in $(FILES); do \
		curl -T $$file ftp://$(FTP_USER):$(FTP_PASS)@$(FTP_HOST)$(FTP_DIR); \
	done
	@echo "Upload complete"


.PHONY: format
format:
	prettier --write style.css index.html --print-width 120







