import InputComponent from '../../../systems/custom-system-builder/module/sheets/components/InputComponent.js';

/**
 * Dots Input component
 * @ignore
 */
class DotsInput extends InputComponent {
    static valueType = 'number'; // The value will be a number (0-5)

    /**
     * DotsInput constructor
     * @param {Object} data Component data
     * @param {string} data.key Component key
     * @param {string|null} [data.tooltip] Component tooltip
     * @param {string} data.templateAddress Component address in template, i.e. component path from actor.system object
     * @param {string|null} [data.label=null] Field label
     * @param {string|null} [data.size=null] Field size. Can be full-size, small, medium or large.
     * @param {string|null} [data.cssClass=null] Additional CSS class to apply at render
     * @param {Number} [data.role=0] Component minimum role
     * @param {Number} [data.permission=0] Component minimum permission
     * @param {string|null} [data.visibilityFormula=null] Component visibility formula
     * @param {Number} [data.maxValue=5] Maximum number of dots
     * @param {Container|null} [data.parent=null] Component's container
     */
    constructor({
                    key,
                    tooltip = null,
                    templateAddress,
                    label = null,
                    size = null,
                    cssClass = null,
                    role = 0,
                    permission = 0,
                    visibilityFormula = null,
                    maxValue = 5, // Default maximum value
                    parent = null
                }) {
        super({
            key: key,
            tooltip: tooltip,
            templateAddress: templateAddress,
            label: label,
            defaultValue: 0, // Default to 0 dots
            size: size,
            cssClass: cssClass,
            role: role,
            permission: permission,
            visibilityFormula: visibilityFormula,
            parent: parent
        });

        this.maxValue = maxValue;
    }

    /**
     * Renders component
     * @override
     * @param {TemplateSystem} entity Rendered entity (actor or item)
     * @param {boolean} [isEditable=true] Is the component editable by the current user ?
     * @return {Promise<JQuery<HTMLElement>>} The jQuery element holding the component
     */
    async _getElement(entity, isEditable = true, options = {}) {
        let jQElement = await super._getElement(entity, isEditable, options);

        // Generate the dots HTML
        let dotsHTML = '';
        let currentValue = entity.system[this.templateAddress]; // Get the current value

        for (let i = 1; i <= this.maxValue; i++) {
            let filledClass = i <= currentValue ? 'filled' : 'empty';
            dotsHTML += `<span class="dot ${filledClass}" data-value="${i}"></span>`;
        }

        // Add the dots HTML to the element
        jQElement.html(`<div class="dots-container">${dotsHTML}</div>`);

        // Add click event listeners to the dots (if editable)
        if (isEditable) {
            jQElement.find('.dot').on('click', (event) => {
                let newValue = parseInt($(event.target).data('value'));
                entity.update({[`system.${this.templateAddress}`]: newValue});
            });
        }

        return jQElement;
    }

    /**
     * Returns serialized component
     * @override
     * @return {Object}
     */
    toJSON() {
        let jsonObj = super.toJSON();

        return {
            ...jsonObj,
            type: 'dotsInput',
            maxValue: this.maxValue
        };
    }

    /**
     * Creates component from JSON description
     * @override
     * @param {Object} json
     * @param {string} templateAddress
     * @param {Container|null} parent
     * @return {DotsInput}
     */
    static fromJSON(json, templateAddress, parent = null) {
        return new DotsInput({
            key: json.key,
            tooltip: json.tooltip,
            templateAddress: templateAddress,
            label: json.label,
            size: json.size,
            cssClass: json.cssClass,
            role: json.role,
            permission: json.permission,
            visibilityFormula: json.visibilityFormula,
            maxValue: json.maxValue,
            parent: parent
        });
    }

    /**
     * Gets pretty name for this component's type
     * @return {string} The pretty name
     * @throws {Error} If not implemented
     */
    static getPrettyName() {
        return 'Dots Input';
    }

    /**
     * Get configuration form for component creation / edition
     * @return {Promise<JQuery<HTMLElement>>} The jQuery element holding the component
     */
    static async getConfigForm(existingComponent) {
        let mainElt = $('<div></div>');

        mainElt.append(
            await renderTemplate(
                `modules/csb-dots-input/templates/components/dotsInput.html`,
                existingComponent
            )
        );

        return mainElt;
    }

    /**
     * Extracts configuration from submitted HTML form
     * @override
     * @param {JQuery<HTMLElement>} html The submitted form
     * @return {Object} The JSON representation of the component
     * @throws {Error} If configuration is not correct
     */
    static extractConfig(html) {
        let fieldData = super.extractConfig(html);

        if (!fieldData.key) {
            throw new Error('Component key is mandatory for dots input');
        }

        fieldData.label = html.find('#dotsInputLabel').val();
        fieldData.size = html.find('#dotsInputSize').val();
        fieldData.maxValue = parseInt(html.find('#dotsInputMaxValue').val()) || 5; // Get max value

        return fieldData;
    }
}

Hooks.once('customSystemBuilderInit', () => {
    componentFactory.addComponentType('dotsInput', DotsInput);
    console.log("Custom System Builder Dots Input Module:  Dots Input component registered.");
});