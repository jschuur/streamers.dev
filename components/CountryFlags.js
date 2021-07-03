import getUnicodeFlagIcon from 'country-flag-icons/unicode';

export default function CountryFlags({ channel: { country, country2 } }) {
  const countries = [country, country2].filter(Boolean);

  return (
    <>
      <div className='text-center mt-1 -mb-1'>
        {countries[0] && <>{getUnicodeFlagIcon(countries[0].toUpperCase())}</>}
      </div>
      <div className='text-center -mt-1'>
        {countries[1] && <>{getUnicodeFlagIcon(countries[1].toUpperCase())}</>}
      </div>
    </>
  );
}
