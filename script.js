document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contactForm");
    const resultModal = document.getElementById("resultModal");
    let modalInstance = null;

    if (form) {
        console.log("✅ Форма найдена. Начинаем настройку...");

        if (resultModal && typeof bootstrap !== 'undefined') {
            modalInstance = new bootstrap.Modal(resultModal);
        } else {
            console.warn("⚠️ Модальное окно или Bootstrap не найдены.");
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            console.log("🛑 Отправка формы отменена.");

            const nameInput = document.getElementById("name");
            const phoneInput = document.getElementById("phone");
            const emailInput = document.getElementById("email");
            const modelSelect = document.getElementById("model");

            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const model = modelSelect ? modelSelect.value : '';

            const formData = { name, phone, email, model, timestamp: new Date().toLocaleString() };
            console.log("📋 Данные формы:", formData);

            let errors = [];

            // ------------------ ПРОВЕРКА ИМЕНИ ------------------
            if (!name) {
                errors.push("Имя обязательно для заполнения.");
            } else {
                // Разрешены: буквы (русские и английские), пробелы, дефисы. Нельзя начинать или заканчивать дефисом.
                if (!/^[a-zA-Zа-яА-ЯёЁ]+(?:[-\s][a-zA-Zа-яА-ЯёЁ]+)*$/.test(name)) {
                    errors.push("Имя должно содержать только буквы, пробелы или дефисы (не в начале/конце).");
                }
            }

            // ------------------ ПРОВЕРКА ТЕЛЕФОНА ------------------
            if (!phone) {
                errors.push("Телефон обязателен для заполнения.");
            } else {
                // Проверка на недопустимые символы
                if (/[^0-9\s\+\-\(\)]/.test(phone)) {
                    errors.push("Телефон содержит недопустимые символы. Используйте только цифры, пробелы, +, -, (, ).");
                } else {
                    const digitsOnly = phone.replace(/\D/g, '');
                    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
                        errors.push("Телефон должен содержать 10-11 цифр (пример: +7 999 123-45-67).");
                    }
                }
            }

            // ------------------ ПРОВЕРКА EMAIL (УЛУЧШЕННАЯ) ------------------
            if (!email) {
                errors.push("Email обязателен для заполнения.");
            } else {
                // Общая структура email (упрощённая проверка на наличие @ и общей длины)
                if (email.length > 254) {
                    errors.push("Email слишком длинный.");
                } else {
                    const atIndex = email.indexOf('@');
                    const lastAtIndex = email.lastIndexOf('@');

                    // Должен быть ровно один @
                    if (atIndex === -1 || atIndex !== lastAtIndex) {
                        errors.push("Email должен содержать ровно один символ @.");
                    } else {
                        const localPart = email.substring(0, atIndex);
                        const domain = email.substring(atIndex + 1);

                        // Проверка локальной части
                        if (localPart.length === 0) {
                            errors.push("Локальная часть email (до @) не может быть пустой.");
                        } else if (localPart.length > 64) {
                            errors.push("Локальная часть email слишком длинная (максимум 64 символа).");
                        } else if (/^\.|\.$|\.\./.test(localPart)) {
                            errors.push("Локальная часть email не может начинаться или заканчиваться точкой, а также содержать две точки подряд.");
                        } else if (!/^[a-zA-Z0-9._%+-]+$/.test(localPart)) {
                            errors.push("Локальная часть email содержит недопустимые символы. Разрешены: буквы, цифры, . _ % + -");
                        }

                        // Проверка домена
                        if (domain.length === 0) {
                            errors.push("Домен email (после @) не может быть пустым.");
                        } else if (domain.length > 255) {
                            errors.push("Домен email слишком длинный.");
                        } else if (/^\.|\.$|\.\./.test(domain)) {
                            errors.push("Домен email не может начинаться или заканчиваться точкой, а также содержать две точки подряд.");
                        } else if (/^[^a-zA-Z]/.test(domain)) {
                            // Домен должен начинаться с буквы (для простоты, можно разрешить цифру в начале, но тогда домен типа 123.ru пропустим, а это нежелательно)
                            errors.push("Домен должен начинаться с буквы.");
                        } else {
                            // Проверка на наличие хотя бы одной точки в домене и правильной зоны
                            const lastDot = domain.lastIndexOf('.');
                            if (lastDot === -1) {
                                errors.push("Домен должен содержать точку (например, domain.ru).");
                            } else {
                                const tld = domain.substring(lastDot + 1);
                                if (tld.length < 2) {
                                    errors.push("Доменная зона (после последней точки) должна содержать минимум 2 символа.");
                                } else if (!/^[a-zA-Z]{2,}$/.test(tld)) {
                                    errors.push("Доменная зона должна состоять только из букв (например, .ru, .com).");
                                }

                                // Проверка, что в домене есть хотя бы одна буква (чтобы отсечь домены из одних цифр)
                                if (!/[a-zA-Z]/.test(domain)) {
                                    errors.push("Домен должен содержать хотя бы одну букву.");
                                }

                                // Дополнительно: проверить, что нет двух дефисов подряд, дефисов в начале/конце домена
                                if (/^-|-$|--/.test(domain)) {
                                    errors.push("Домен не может содержать дефис в начале, в конце или два дефиса подряд.");
                                }
                            }
                        }
                    }
                }
            }

            // Формируем содержимое модального окна
            let modalTitle = '';
            let modalMessage = '';
            let isSuccess = false;

            if (errors.length > 0) {
                modalTitle = 'Ошибка ввода';
                modalMessage = `
                    <div class="error-list">
                        <h6>Пожалуйста, исправьте следующие ошибки:</h6>
                        <ul>
                            ${errors.map(err => `<li>${err}</li>`).join('')}
                        </ul>
                    </div>
                `;
                console.warn("❌ Ошибки валидации:", errors);
            } else {
                modalTitle = 'Спасибо за заявку!';
                modalMessage = `
                    <div class="thankyou-title">СПАСИБО,<br>${name}!</div>
                    <div class="thankyou-text">
                        Наш менеджер свяжется с вами<br>по телефону в самое ближайшее время.
                    </div>
                    <div class="small text-muted mt-4">
                        <i class="bi bi-phone me-1"></i> ${phone}<br>
                        <i class="bi bi-envelope me-1"></i> ${email}
                    </div>
                `;
                isSuccess = true;
                console.log("✅ Форма успешно прошла валидацию.");
            }

            if (modalInstance) {
                const modalTitleEl = resultModal.querySelector('.modal-title');
                const modalBodyEl = resultModal.querySelector('.modal-body');
                if (modalTitleEl) modalTitleEl.textContent = modalTitle;
                if (modalBodyEl) modalBodyEl.innerHTML = modalMessage;
                modalInstance.show();
            } else {
                alert((errors.length > 0 ? 'Ошибки:\n' + errors.join('\n') : 'Спасибо! Заявка отправлена.'));
            }

            if (isSuccess) form.reset();
        });
    }

    // ================== ПОИСК ПО КАТАЛОГУ ==================
    const searchInput = document.getElementById("searchInput");
    const productContainer = document.getElementById("productList");

    if (searchInput && productContainer) {
        console.log("✅ Поле поиска найдено.");
        searchInput.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase().trim();
            const products = productContainer.querySelectorAll(".product-card");
            products.forEach(card => {
                const productName = card.getAttribute("data-name") || '';
                const titleElement = card.querySelector(".card-title");
                const titleText = titleElement ? titleElement.textContent.toLowerCase() : '';
                if (productName.toLowerCase().includes(searchTerm) || titleText.includes(searchTerm)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    console.log("🎉 Скрипт полностью загружен и готов к работе.");
});
