import { DropdownButton, InputField, FlyoutMenu } from '@dhis2/ui';
import { Button, ButtonStrip } from '@dhis2/ui';
import { set } from 'date-fns';
import React, {
  cloneElement,
  isValidElement,
  ReactNode,
  useEffect,
  useState,
} from 'react';

type PopOverDropdownProps = {
  component: ReactNode | ReactNode[]; 
  // onUpdate?: (value: string) => void;
  // onReset?: () => void;
};

export const PopOverDropdown = ({
  component,
}: //  onUpdate, onReset
PopOverDropdownProps) => {
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [componentProps, setComponentProps] = useState<any>();

  type ClearIconProps = {
    className?: string;
    [key: string]: any;
  };

  const ClearIcon = ({ className, ...props }: ClearIconProps) => (
    <svg
      className={className}
      {...props}
      viewBox="0 0 24 24"
      width={16}
      height={16}
    >
      <path d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
    </svg>
  );

  // const clonedComponent = isValidElement(component) && cloneElement(component);
  const renderComponents = Array.isArray(component)
  ? component.map((comp, idx) =>
      isValidElement(comp) ? cloneElement(comp, { key: idx }) : comp
    )
  : isValidElement(component)
    ? cloneElement(component)
    : component;

  useEffect(() => {
    if (isValidElement(component)) {
      setComponentProps(component.props);
    }
  }, [component]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <DropdownButton
        name="customDropdown"
        open={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        component={
          <div>
            <FlyoutMenu>
              <div style={{ padding: '16px' }}>
                {/* {clonedComponent} */}
                {renderComponents}
                <ButtonStrip>
                  <Button
                    primary
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    update
                  </Button>
                  <Button
                    onClick={() => {
                      setValue('');
                      setIsOpen(false);
                    }}
                  >
                    reset
                  </Button>
                </ButtonStrip>
              </div>
            </FlyoutMenu>
          </div>
        }
      >
        label
        {/* {componentProps?.label} {componentProps?.value} */}
        {/* {componentProps?.value && ( */}
          <span
            onClick={(event) => {
              event.stopPropagation();
              console.log('Button clicked! Value:', value);
            }}
            style={{ display: 'inline-flex', alignItems: 'center' }}
          >
            <ClearIcon className="my-icon-class" />
          </span>
        {/* )} */}
      </DropdownButton>
    </div>
  );
};


