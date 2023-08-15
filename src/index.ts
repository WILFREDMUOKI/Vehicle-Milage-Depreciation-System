// cannister code goes here
import { $query, $update, Record, StableBTreeMap, Vec, match, Result, nat64, ic, Opt } from 'azle';
import { v4 as uuidv4 } from 'uuid';

type Vehicle = Record<{
    id: string;
    model: string;
    version: string;
    mileage: nat64;
    depreciation: nat64;
    createdAt: nat64;
}>

type VehiclePayload = Record<{
    model: string;
    version: string;
    mileage: nat64;
    depreciation: nat64;
}>

type MileagePayload = Record<{
    miles: nat64;
}>

type DepreciationPayload = Record<{
    depreciation: nat64;
}>

const vehicleStorage = new StableBTreeMap<string, Vehicle>(0, 44, 1024);

$query;
export function getVehicle(id: string): Result<Vehicle, string> {
    return match(vehicleStorage.get(id), {
        Some: (Vehicle) => Result.Ok<Vehicle, string>(Vehicle),
        None: () => Result.Err<Vehicle, string>(`a vehicle with id=${id} not found`)
    });
}

$update
export function createVehicle(payload: VehiclePayload) : Result<Vehicle, string>{
    const vehicle: Vehicle = {...payload, id: uuidv4(), createdAt: ic.time()}
    vehicleStorage.insert(vehicle.id, vehicle);
    return Result.Ok(vehicle);
}

$update;
export function addMileage(id: string, payload: MileagePayload): Result<Vehicle, string> {
    return match(vehicleStorage.get(id), {
        Some: (Vehicle) => {
            const updatedVehicle: Vehicle = {
                ...Vehicle,
                mileage: Vehicle.mileage + payload.miles,
                createdAt: ic.time()
            };
            vehicleStorage.insert(Vehicle.id, updatedVehicle);
            return Result.Ok<Vehicle, string>(updatedVehicle);
        },
        None: () => Result.Err<Vehicle, string>(`a vehicle with id=${id} not found`)
    });
}


$update;
export function updateDepreciation(id: string, payload: DepreciationPayload): Result<Vehicle, string> {
    return match(vehicleStorage.get(id), {
        Some: (Vehicle) => {
            const updatedVehicle: Vehicle = {
                ...Vehicle,
                depreciation: payload.depreciation,
                createdAt: ic.time()
            };
            vehicleStorage.insert(Vehicle.id, updatedVehicle);
            return Result.Ok<Vehicle, string>(updatedVehicle);
        },
        None: () => Result.Err<Vehicle, string>(`a vehicle with id=${id} not found`)
    });
}



// a workaround to make uuid package work with Azle
globalThis.crypto = {
    getRandomValues: () => {
        let array = new Uint8Array(32)

        for (let i = 0; i < array.length; i++) {
            array[i] = Math.floor(Math.random() * 256)
        }

        return array
    }
}