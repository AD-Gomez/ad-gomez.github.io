import { Controller, FormProvider, useFieldArray, useForm } from 'react-hook-form';
import axios from 'axios'
import logoCayad from '../../../public/img/logo-cayad.webp'
import AuthorizeNetSeal from '../../components/buttons/AuthorizeNetSeal'
import type { FormQuoteTypes } from '../../types/formQuote.type';
import AutocompleteInput from '../inputs/AutoCompletInput';
import CheckboxInput from '../inputs/CustomCheckbox';
import AutoSuggestInput from '../inputs/AutoSuggestInput';
import { useEffect, useState } from 'react';
import DateInput from '../inputs/CustomInputDate';
import CustomInputOnlyText from '../inputs/CustomInputOnlyText';
import CustomInput from '../inputs/CustomInput';
import CustomInputPhone from '../inputs/CustomInputPhone';
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup';


const validationSchema = yup.object().shape({
  origin_city: yup.string()
    .required('Please provide a valid city or zip code.'),
  destination_city: yup.string()
    .required('Please provide a valid city or zip code.'),
  transport_type: yup.string()
    .required('Transport type is required'),
  Vehicles: yup.array().of(
    yup.object().shape({
      vehicle_model_year: yup.string().required('vehicleYear is required'),
      vehicle_make: yup.string().required('vehicle_make is required'),
      vehicle_model: yup.string().required('vehicle_model is required'),
      vehicleOperable: yup.string().required('vehicleOperable is required')
    })
  ).required(),
  first_name: yup.string()
    .required('Name is required')
    .matches(/^[a-zA-Z\s]+$/, 'Name must only contain letters and spaces')
    .min(3, 'Name must be at least 3 characters')
    .max(20, ''),
  phone: yup.string()
    .required('Phone is required'),
  email: yup.string()
    .required('Email is required')
    .email('Email is not valid'),
  ship_date: yup.date()
    .required('Date is required')
})
const FormQuote = () => {
  const methods = useForm<FormQuoteTypes>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      Vehicles: [
        { vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicleOperable: '1' },
      ],
    },
  });
  const { handleSubmit, control, trigger, setError, clearErrors, getValues, setValue, watch, formState: { errors } } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'Vehicles',
  });

  const [years, setYears] = useState<{ value: string; label: string }[]>([]);
  const [vehicleMarks, setVehicleMarks] = useState<{ [key: number]: { value: string; label: string }[] }>({});
  const [vehicleModels, setVehicleModels] = useState<{ [key: number]: { value: string; label: string }[] }>({});

  // Generate years dynamically
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const yearsArray = Array.from(new Array(30), (val, index) => {
      const year = currentYear - index;
      return { value: year.toString(), label: year.toString() };
    });
    setYears(yearsArray);
  }, []);

  // Update vehicle marks when year is selected
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.endsWith('vehicle_model_year')) {
        const index = parseInt(name.split('.')[1], 10);
        const marksData = [
          { label: "Ford", value: "ford" },
          { label: "Chevrolet", value: "chevrolet" },
          { label: "Dodge", value: "dodge" },
          { label: "Jeep", value: "jeep" },
          { label: "Tesla", value: "tesla" },
          { label: "Cadillac", value: "cadillac" },
          { label: "Buick", value: "buick" },
          { label: "GMC", value: "gmc" },
          { label: "Chrysler", value: "chrysler" },
          { label: "Lincoln", value: "lincoln" },
          { label: "Ram", value: "ram" },
          { label: "BMW", value: "bmw" },
          { label: "Mercedes-Benz", value: "mercedes-benz" },
          { label: "Audi", value: "audi" },
          { label: "Volkswagen", value: "volkswagen" },
          { label: "Porsche", value: "porsche" },
          { label: "Volvo", value: "volvo" },
          { label: "Land Rover", value: "land rover" },
          { label: "Jaguar", value: "jaguar" },
          { label: "Mini", value: "mini" },
          { label: "Alfa Romeo", value: "alfa romeo" },
          { label: "Ferrari", value: "ferrari" },
          { label: "Lamborghini", value: "lamborghini" },
          { label: "Bentley", value: "bentley" },
          { label: "Rolls-Royce", value: "rolls-royce" },
          { label: "Toyota", value: "toyota" },
          { label: "Honda", value: "honda" },
          { label: "Nissan", value: "nissan" },
          { label: "Subaru", value: "subaru" },
          { label: "Mazda", value: "mazda" },
          { label: "Mitsubishi", value: "mitsubishi" },
          { label: "Lexus", value: "lexus" },
          { label: "Infiniti", value: "infiniti" },
          { label: "Acura", value: "acura" },
          { label: "Hyundai", value: "hyundai" },
          { label: "Kia", value: "kia" },
          { label: "Genesis", value: "genesis" },
        ];
        setVehicleMarks(prev => ({ ...prev, [index]: marksData }));
        setVehicleModels(prev => ({ ...prev, [index]: [] }));

        const updatedVehicles = getValues('Vehicles').map((item, idx) => (
          idx === index ? { ...item, vehicle_make: '', vehicle_model: '' } : item
        ));
        setValue('Vehicles', updatedVehicles);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, getValues]);

  // Update vehicle models when make is selected
  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name && name.endsWith('vehicle_make')) {
        const index = parseInt(name.split('.')[1], 10);
        const vehicleYear: any = getValues(`Vehicles.${index}.vehicle_model_year`);
        const vehicleMake: any = getValues(`Vehicles.${index}.vehicle_make`);
        if (vehicleYear && vehicleMake) {
          axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/GetModelsForMakeYear/make/${vehicleMake}/modelyear/${vehicleYear}?format=json`)
            .then((response) => {
              const modelsData = response.data.Results.map((model: any) => ({
                value: model.Model_Name,
                label: model.Model_Name,
              }));
              setVehicleModels(prev => ({ ...prev, [index]: modelsData }));
              const updatedVehicles = getValues('Vehicles').map((item, idx) => (
                idx === index ? { ...item, vehicle_model: '' } : item
              ));
              setValue('Vehicles', updatedVehicles);
            });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, setValue, getValues]);

  console.log(fields)
  const onSubmit = (data: FormQuoteTypes) => {
    console.log(data)
  };

  return (
    <FormProvider {...methods}>
      <div className="h-max w-[60%] md:w-full flex flex-col  items-center bg-white rounded">
        <form className='h-max w-[100%] md:w-full flex flex-col  items-center' onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-full justify-around mt-4">
            <div className='max-h-[50px] max-w-[200px]'>
              <img src={logoCayad.src} />
            </div>
            <p className=' font-bold text-[180x]'>Get Free Quote Request</p>
            <div className="AuthorizeNetSeal">
              <script type="text/javascript">
                var ANS_customer_id = "40b07bd0-492e-41ef-af3d-203518035d55";
              </script>
              <script
                type="text/javascript"
                src="https://verify.authorize.net:443/anetseal/seal.js"></script>
            </div>
          </div>
          <div className='w-[95%] p-4 mb-4 mt-4 rounded-sm min-h-[150px] max-h-[200px] border-[1px]'>
            <div className='flex w-full'>
              <p className='font-bold'>1</p>
              <p className='ml-2'>
                Origin & Destination
              </p>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-1 gap-4 p-2 mt-4'>
              <div>
                <AutocompleteInput
                  name='origin_city'
                  label='Transport Vehicle FROM'
                  placeholder="Miami, Florida, EE. UU."
                  trigger={trigger}
                  clearErrors={clearErrors}
                  setError={setError}
                />
                <div id="validationOrigin" className="invalid-feedback">
                  {errors.origin_city && <p className="text-red-500 text-xs italic mt-1">{errors.origin_city.message}</p>}
                </div>
              </div>

              <div>
                <AutocompleteInput
                  name='destination_city'
                  label='Transport Vehicle TO'
                  placeholder="Alameda, California, EE. UU."
                  trigger={trigger}
                  clearErrors={clearErrors}
                  setError={setError}
                />
                <div id="validationOrigin" className="invalid-feedback">
                  {errors.origin_city && <p className="text-red-500 text-xs italic mt-1">{errors.origin_city.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className='w-[95%] p-4  mt-4 rounded-sm min-h-[350px] flex-nowrap overflow-auto max-h-[375px] border-[1px]'>
            <div className='flex w-full'>
              <p className='font-bold'>2</p>
              <p className='ml-2'>
                Vehicle Details
              </p>
            </div>
            <div className=''>
              {fields.map((item, index) => (
                <div key={item.id} className='grid mt-4  grid-cols-2 md:grid-cols-1 min-h-[240px] max-h-[300px]'>
                  <div className=" ">
                    <Controller
                      name={`Vehicles.${index}.vehicle_model_year`}
                      control={control}
                      render={({ field }) => (
                        <AutoSuggestInput {...field} label="Vehicle Year" options={years} />
                      )}
                    />
                  </div>

                  <div className="">
                    <Controller
                      name={`Vehicles.${index}.vehicle_make`}
                      control={control}
                      render={({ field }) => (
                        <AutoSuggestInput {...field} label="Vehicle Make" options={vehicleMarks[index] || []} disabled={!watch(`Vehicles.${index}.vehicle_model_year`)} />
                      )}
                    />
                  </div>

                  <div className="">
                    <Controller
                      name={`Vehicles.${index}.vehicle_model`}
                      control={control}
                      render={({ field }) => (
                        <AutoSuggestInput {...field} options={vehicleModels[index] || []} label="Vehicle Model" disabled={!watch(`Vehicles.${index}.vehicle_make`)} />
                      )}
                    />
                  </div>

                  <div className="flex w-full justify-around">
                    <p className='xs:text-sm'>Is The <b className=''>Vehicle Operable?</b></p>
                    <div>
                      <Controller
                        name={`Vehicles.${index}.vehicleOperable`}
                        control={control}
                        render={({ field }) => (
                          <CheckboxInput {...field} id={`vehicleIsOperable${index}`} value="1" label="Yes" checked={field.value === '1'} />
                        )}
                      />
                    </div>
                    <div>
                      <Controller
                        name={`Vehicles.${index}.vehicleOperable`}
                        control={control}
                        render={({ field }) => (
                          <CheckboxInput {...field} id={`vehicleIsNotOperable${index}`} value="0" label="No" checked={field.value === '0'} />
                        )}
                      />
                    </div>
                  </div>

                  {fields.length > 1 && (
                    <div className="d-flex mb-4 end dashed">
                      <button type="button" onClick={() => remove(index)} className="bg-[#ff0000] text-white w-auto p-2">
                        Remove car
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                className="bg-white border border-btn-blue text-btn-blue py-2 px-4  mb-4"
                type="button"
                onClick={() => append({ vehicle_model_year: '', vehicle_make: '', vehicle_model: '', vehicleOperable: '1' })}
              >
                Add Another Vehicle
              </button>
            </div>
          </div>

          <div className='w-[95%] p-4 mb-8 mt-8 rounded-sm md:min-h-[300px] md:max-h-[350px] min-h-[150px] max-h-[220px] border-[1px]'>
            <div className='flex w-full'>
              <p className='font-bold'>3</p>
              <p className='ml-2'>
                Shipment Details
              </p>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-1 gap-4 p-2 mt-4'>
              <DateInput name='ship_date' label='Date' />

              <CustomInputOnlyText name='first_name' max={20} type='text' label='Name' />

              <CustomInput name='email' max={30} label='Email Address' />

              <CustomInputPhone name='phone' type='text' max={14} label='Phone Number' />
            </div>
          </div>

          <button className='bg-btn-blue mb-2 w-[95%] p-2 text-white rounded hover:bg-btn-hover transition-colors duration-300'>Submit Quote Request</button>
          <a className='text-btn-blue mb-12' href='/'>Cayad Auto Transport</a>
        </form>
      </div>
    </FormProvider>
  )
};

export default FormQuote;
