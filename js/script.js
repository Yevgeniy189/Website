/**
 * PRIKHODKO AI Studio - Main JavaScript
 * Версия: 2.0.0
 * Улучшения: Безопасность, Валидация, Интеграция с Telegram Bot Webhook
 */

(function() {
    'use strict';

    // ========================================
    // КОНФИГУРАЦИЯ
    // ========================================
    const CONFIG = {
        // 🔧 ЗАМЕНИТЕ НА URL ВАШЕГО TELEGRAM BOT WEBHOOK
        WEBHOOK_URL: 'https://YOUR-BOT-URL/webhook/form',
        
        // Таймауты
        TOAST_DURATION: 4000,
        MODAL_ERROR_RESET_DELAY: 5000,
        
        // Валидация
        MIN_NAME_LENGTH: 2,
        MIN_TASK_LENGTH: 10
    };

    // ========================================
    // DOM ELEMENTS
    // ========================================
    const elements = {
        burger: document.getElementById('burger'),
        navLinks: document.getElementById('navLinks'),
        body: document.body,
        modal: document.getElementById('leadModal'),
        modalClose: document.getElementById('leadModalClose'),
        modalTitle: document.getElementById('leadModalTitle'),
        modalText: document.getElementById('leadModalText'),
        heroForm: document.getElementById('heroForm'),
        contactForm: document.getElementById('contactForm'),
        heroSubmitBtn: document.getElementById('heroSubmitBtn'),
        contactSubmitBtn: document.getElementById('contactSubmitBtn'),
        yearSpan: document.getElementById('year')
    };

    // ========================================
    // NAVIGATION
    // ========================================
    function initNavigation() {
        if (!elements.burger || !elements.navLinks) return;

        elements.burger.addEventListener('click', toggleMenu);
        
        // Закрытие меню при клике на ссылку
        elements.navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', (e) => {
            if (!elements.navLinks.contains(e.target) && 
                !elements.burger.contains(e.target) && 
                elements.navLinks.classList.contains('open')) {
                closeMenu();
            }
        });

        // Закрытие меню при Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.navLinks.classList.contains('open')) {
                closeMenu();
                elements.burger.focus();
            }
        });
    }

    function toggleMenu() {
        const isOpen = elements.navLinks.classList.toggle('open');
        elements.burger.classList.toggle('active', isOpen);
        elements.burger.setAttribute('aria-expanded', String(isOpen));
        elements.body.classList.toggle('no-scroll', isOpen);
    }

    function closeMenu() {
        elements.navLinks.classList.remove('open');
        elements.burger.classList.remove('active');
        elements.burger.setAttribute('aria-expanded', 'false');
        elements.body.classList.remove('no-scroll');
    }

    // ========================================
    // MODAL
    // ========================================
    function initModal() {
        if (!elements.modal) return;

        elements.modalClose?.addEventListener('click', hideModal);
        
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) hideModal();
        });

        // Закрытие по Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && elements.modal.classList.contains('open')) {
                hideModal();
            }
        });
    }

    function showModal(title, text, isError = false) {
        if (!elements.modal) return;

        if (title) elements.modalTitle.textContent = title;
        if (text) {
            elements.modalText.innerHTML = text;
            elements.modalText.style.color = isError ? 'var(--error)' : '';
        }

        elements.modal.classList.add('open');
        elements.modal.setAttribute('aria-hidden', 'false');
        elements.body.classList.add('no-scroll');
        
        // Фокус на модальное окно для доступности
        elements.modal.querySelector('.modal__content').focus();
    }

    function hideModal() {
        if (!elements.modal) return;

        elements.modal.classList.remove('open');
        elements.modal.setAttribute('aria-hidden', 'true');
        elements.body.classList.remove('no-scroll');

        // Восстановление исходного текста
        setTimeout(() => {
            elements.modalTitle.textContent = 'Спасибо! Заявка принята ✅';
            elements.modalText.innerHTML = 'Мы свяжемся с вами в ближайшее время. Обычно отвечаем в течение 2 часов в рабочее время.<br>Также проверьте папку "Спам", если не найдёте наше письмо.';
            elements.modalText.style.color = '';
        }, 300);
    }

    // ========================================
    // TOAST NOTIFICATIONS
    // ========================================
    function showToast(message, type = 'success') {
        // Удаляем существующий toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.innerHTML = `
            <span>${type === 'success' ? '✅' : '❌'}</span>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Показываем toast
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Скрываем через заданное время
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, CONFIG.TOAST_DURATION);
    }

    // ========================================
    // CHECKBOX MANAGEMENT
    // ========================================
    function setupCheckbox(checkboxId, customId, labelId, errorId) {
        const checkbox = document.getElementById(checkboxId);
        const customCheckbox = document.getElementById(customId);
        const label = document.getElementById(labelId);
        const error = document.getElementById(errorId);

        if (!checkbox || !customCheckbox || !label) return null;

        // Клик по кастомному чекбоксу
        label.addEventListener('click', (e) => {
            // Если кликнули по ссылке - не переключаем чекбокс
            if (e.target.tagName === 'A' || e.target.closest('a')) {
                return;
            }

            e.preventDefault();
            checkbox.checked = !checkbox.checked;
            customCheckbox.classList.toggle('checked', checkbox.checked);
            clearCheckboxError(customCheckbox, error);
        });

        // Валидация при отправке формы
        checkbox.addEventListener('invalid', () => {
            showCheckboxError(customCheckbox, error);
        });

        // Сброс ошибки при изменении
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                clearCheckboxError(customCheckbox, error);
            }
        });

        return { checkbox, customCheckbox, error };
    }

    function showCheckboxError(customCheckbox, error) {
        if (error) error.classList.add('show');
        if (customCheckbox) {
            customCheckbox.style.borderColor = 'var(--error)';
            customCheckbox.style.boxShadow = '0 0 0 3px rgba(248, 113, 113, 0.2)';
        }
    }

    function clearCheckboxError(customCheckbox, error) {
        if (error) error.classList.remove('show');
        if (customCheckbox) {
            customCheckbox.style.borderColor = '';
            customCheckbox.style.boxShadow = '';
        }
    }

    // ========================================
    // FORM VALIDATION
    // ========================================
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        // Поддержка различных форматов номеров
        const re = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{7,}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    function validateContact(value) {
        // Проверяем, является ли значение email или телефоном
        return validateEmail(value) || validatePhone(value);
    }

    function validateName(name) {
        return name.trim().length >= CONFIG.MIN_NAME_LENGTH;
    }

    function validateTask(task) {
        return task.trim().length >= CONFIG.MIN_TASK_LENGTH;
    }

    function setInputError(input, hasError) {
        if (hasError) {
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
        } else {
            input.classList.remove('error');
            input.removeAttribute('aria-invalid');
        }
    }

    // ========================================
    // HONEYPOT SPAM PROTECTION
    // ========================================
    function isSpamSubmission(form) {
        // Проверяем honeypot поле
        const honeypot = form.querySelector('.hp-field input');
        if (honeypot && honeypot.value !== '') {
            console.warn('Spam detected via honeypot');
            return true;
        }

        // Проверяем время заполнения формы (минимум 2 секунды)
        const formStartTime = form.dataset.startTime;
        if (formStartTime) {
            const fillTime = Date.now() - parseInt(formStartTime);
            if (fillTime < 2000) {
                console.warn('Spam detected: form filled too quickly');
                return true;
            }
        }

        return false;
    }

    // ========================================
    // FORM SUBMISSION
    // ========================================
    function setButtonLoading(button, isLoading) {
        if (!button) return;

        button.disabled = isLoading;
        const span = button.querySelector('span');
        if (span) {
            if (isLoading) {
                button.dataset.originalText = span.textContent;
                span.innerHTML = '<span class="spinner"></span> Отправка...';
            } else {
                span.textContent = button.dataset.originalText || 'Отправить';
            }
        }
    }

    async function submitFormToWebhook(formData) {
        const response = await fetch(CONFIG.WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error ${response.status}`);
        }

        return response.json();
    }

    async function handleFormSubmit(e, formId, checkboxObj) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');

        // Проверка на спам
        if (isSpamSubmission(form)) {
            // Молча показываем успех для спам-ботов
            showModal('Спасибо! Заявка принята ✅');
            form.reset();
            return false;
        }

        // Валидация чекбокса
        if (checkboxObj && !checkboxObj.checkbox.checked) {
            showCheckboxError(checkboxObj.customCheckbox, checkboxObj.error);
            checkboxObj.error?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return false;
        }

        // Получаем данные формы
        const nameValue = form.name?.value?.trim() || '';
        const contactValue = form.email?.value?.trim() || form.contact?.value?.trim() || '';
        const taskValue = form.task?.value?.trim() || '';

        // Валидация полей
        let hasErrors = false;

        if (!validateName(nameValue)) {
            setInputError(form.name, true);
            hasErrors = true;
        }

        if (!validateContact(contactValue)) {
            const emailInput = form.email || form.contact;
            setInputError(emailInput, true);
            hasErrors = true;
        }

        if (taskValue && !validateTask(taskValue)) {
            setInputError(form.task, true);
            hasErrors = true;
        }

        if (hasErrors) {
            showToast('Пожалуйста, проверьте заполненные поля', 'error');
            return false;
        }

        // Формируем данные для отправки на webhook
        const payload = {
            name: nameValue,
            contact: contactValue,
            task: taskValue,
            form: formId,
            timestamp: new Date().toISOString(),
            source: window.location.href,
            userAgent: navigator.userAgent
        };

        setButtonLoading(submitButton, true);

        try {
            await submitFormToWebhook(payload);

            // Успешная отправка
            showModal(
                'Спасибо! Заявка принята ✅',
                'Мы свяжемся с вами в ближайшее время. Обычно отвечаем в течение 2 часов в рабочее время.<br>Также проверьте папку "Спам", если не найдёте наше письмо.'
            );
            
            showToast('Заявка успешно отправлена!', 'success');
            form.reset();

            // Сброс чекбоксов
            if (checkboxObj) {
                checkboxObj.checkbox.checked = false;
                checkboxObj.customCheckbox.classList.remove('checked');
            }

        } catch (error) {
            console.error('Ошибка отправки:', error);

            showModal(
                'Ошибка отправки',
                'Не удалось отправить заявку. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую.',
                true
            );

            showToast('Ошибка отправки. Попробуйте снова.', 'error');
        } finally {
            setButtonLoading(submitButton, false);
        }

        return false;
    }

    // ========================================
    // FORM INITIALIZATION
    // ========================================
    function initForms() {
        // Настройка чекбоксов
        const heroCheckbox = setupCheckbox(
            'heroCheckbox',
            'heroCheckboxCustom',
            'heroCheckboxLabel',
            'heroCheckboxError'
        );

        const contactCheckbox = setupCheckbox(
            'contactCheckbox',
            'contactCheckboxCustom',
            'contactCheckboxLabel',
            'contactCheckboxError'
        );

        // Обработчики форм
        if (elements.heroForm) {
            elements.heroForm.dataset.startTime = Date.now();
            elements.heroForm.addEventListener('submit', (e) => 
                handleFormSubmit(e, 'hero', heroCheckbox)
            );
        }

        if (elements.contactForm) {
            elements.contactForm.dataset.startTime = Date.now();
            elements.contactForm.addEventListener('submit', (e) => 
                handleFormSubmit(e, 'contact', contactCheckbox)
            );
        }

        // Валидация email на лету
        document.querySelectorAll('input[type="email"]').forEach(input => {
            input.addEventListener('blur', function() {
                if (this.value && !validateEmail(this.value)) {
                    setInputError(this, true);
                } else {
                    setInputError(this, false);
                }
            });

            input.addEventListener('input', function() {
                setInputError(this, false);
            });
        });

        // Сброс ошибок при вводе
        document.querySelectorAll('.input, textarea').forEach(input => {
            input.addEventListener('input', function() {
                setInputError(this, false);
            });
        });
    }

    // ========================================
    // SCROLL ANIMATIONS
    // ========================================
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.card, .service-card, .step').forEach(el => {
            observer.observe(el);
        });
    }

    // ========================================
    // FAQ ACCORDION
    // ========================================
    function initFAQ() {
        document.querySelectorAll('details').forEach(detail => {
            detail.addEventListener('toggle', function() {
                if (this.open) {
                    const content = this.querySelector('p');
                    if (content) {
                        content.style.animation = 'fadeIn 0.3s ease';
                    }
                }
            });
        });
    }

    // ========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            if (!href || href === '#') return;

            anchor.addEventListener('click', function(e) {
                // Для CTA ссылок - обычное поведение
                if (href === '#contact' || href === '#cases') {
                    return;
                }

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const header = document.querySelector('.site-header');
                    const headerHeight = header ? header.offsetHeight : 74;
                    const targetPosition = target.getBoundingClientRect().top + 
                        window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // PRIVACY POLICY LINKS
    // ========================================
    function initPrivacyLinks() {
        // Восстанавливаем нормальное поведение ссылок на политику
        document.querySelectorAll('a[href*="disk.yandex"]').forEach(link => {
            link.setAttribute('target', '_blank');
            link.setAttribute('rel', 'noopener noreferrer');
        });

        // Обработчик для политики конфиденциальности
        document.addEventListener('click', function(e) {
            if (e.target.closest('a[href*="disk.yandex"]')) {
                const link = e.target.closest('a[href*="disk.yandex"]');
                e.stopPropagation();
                window.open(link.href, '_blank', 'noopener,noreferrer');
                e.preventDefault();
            }
        });
    }

    // ========================================
    // FOOTER YEAR
    // ========================================
    function setFooterYear() {
        if (elements.yearSpan) {
            elements.yearSpan.textContent = new Date().getFullYear();
        }
    }

    // ========================================
    // KEYBOARD NAVIGATION
    // ========================================
    function initKeyboardNav() {
        // Закрытие модальных окон по Escape уже реализовано выше

        // Trap focus в модальном окне
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && elements.modal?.classList.contains('open')) {
                const focusableElements = elements.modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    // ========================================
    // INITIALIZATION
    // ========================================
    function init() {
        initNavigation();
        initModal();
        initForms();
        initScrollAnimations();
        initFAQ();
        initSmoothScroll();
        initPrivacyLinks();
        initKeyboardNav();
        setFooterYear();

        console.log('PRIKHODKO AI Studio v2.0.0 initialized');
    }

    // Запуск при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Экспорт конфигурации для возможности изменения извне
    window.PRIKHODKO_CONFIG = CONFIG;

})();
