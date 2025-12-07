import { useState, useRef, useEffect, Children } from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

export default function Select({
    label,
    error,
    helperText,
    fullWidth = false,
    className = '',
    icon,
    children,
    value,
    onChange,
    name,
    placeholder = "Select an option",
    ...props
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Extract options from children
    const options = Children.toArray(children).reduce((acc, child) => {
        if (child.type === 'option') {
            acc.push({
                value: child.props.value,
                label: child.props.children,
                disabled: child.props.disabled
            });
        }
        return acc;
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        if (onChange) {
            // Emulate event object for compatibility with form handlers
            const event = {
                target: {
                    name: name,
                    value: optionValue
                }
            };
            onChange(event);
        }
        setIsOpen(false);
    };

    const toggleOpen = () => !props.disabled && setIsOpen(!isOpen);

    const selectClasses = [
        'select-custom',
        error ? 'select-error' : '',
        isOpen ? 'select-open' : '',
        fullWidth ? 'select-full-width' : '',
        icon ? 'select-with-icon' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div
            className={`select-wrapper ${fullWidth ? 'select-wrapper-full-width' : ''}`}
            ref={containerRef}
        >
            {label && <label className="select-label">{label}</label>}

            <div className="select-container" onClick={toggleOpen}>
                {icon && <span className="select-icon">{icon}</span>}

                <div
                    className={selectClasses}
                    tabIndex={0}
                    role="combobox"
                    aria-expanded={isOpen}
                    {...props}
                >
                    <span className={`select-value ${!selectedOption ? 'select-placeholder' : ''}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>

                    <ChevronDown
                        size={16}
                        className={`select-arrow ${isOpen ? 'select-arrow-open' : ''}`}
                    />
                </div>

                {isOpen && (
                    <ul className="select-dropdown">
                        {options.map((option, index) => {
                            // Skip placeholder options typically used for "Select..."
                            if (option.value === "" && option.disabled) return null;

                            return (
                                <li
                                    key={index}
                                    className={`select-option ${option.value === value ? 'selected' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSelect(option.value);
                                    }}
                                >
                                    {option.label}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {error && <span className="select-error-text">{error}</span>}
            {helperText && !error && <span className="select-helper-text">{helperText}</span>}
        </div>
    );
}
