import {Stream} from "stream";

export class ByteWriter {
    private array: Uint8Array;
    private currentOffset: number;
    private dataView: DataView;
    private littleEndian: boolean;

    constructor(bufferSize: number, littleEndian: boolean = true) {
        this.array = new Uint8Array(bufferSize)
        this.currentOffset = 0;
        this.dataView = new DataView(this.array.buffer);
        this.littleEndian = littleEndian;
    }

    getStream(): Stream {
        let myStream = new Stream.Readable();
        let array = this.array;
        myStream._read = function (size) {
            this.push(array);
            this.push(null);
        };
        return myStream;
    }

    writeByte(b: number) {
        this.dataView.setInt8(this.currentOffset, b)
        this.currentOffset += Int8Array.BYTES_PER_ELEMENT;
    }

    writeFloat(f: number) {
        this.dataView.setFloat32(this.currentOffset, f, this.littleEndian)
        this.currentOffset += Int8Array.BYTES_PER_ELEMENT * 4;
    }

    writeInt32(n: number) {
        this.dataView.setInt32(this.currentOffset, n, this.littleEndian)
        this.currentOffset += Int8Array.BYTES_PER_ELEMENT * 4;
    }

    writeInt64(ll: number) {
        this.dataView.setBigInt64(this.currentOffset, BigInt(ll), this.littleEndian)
        this.currentOffset += Int8Array.BYTES_PER_ELEMENT * 8;
    }
}

export abstract class Serializable {
    public static createWriterFor(written: Serializable): ByteWriter {
        return new ByteWriter(written.serializationLength())
    }

    abstract serializationLength(): number;

    abstract serializeBytes(writer: ByteWriter): void;
}

export class SerializableCollection<T extends Serializable> extends Serializable {
    constructor(protected collection: T[]) {
        super();
    }

    serializationLength(): number {
        return this.collection.reduce((p, c) => p + c.serializationLength(), 4);
    }

    serializeBytes(writer: ByteWriter): void {
        writer.writeInt32(this.collection.length);
        this.collection.forEach(t => t.serializeBytes(writer));
    }
}

export class WeaponSkinDefinition extends Serializable {
    // TODO: unit test this
    static SERIALIZATION_LENGTH = 16;

    constructor(private weaponName: string, // json serialization only
                private weaponId: number, // byte
                private skinId: number, // int32
                private seed: number, // int32
                private wear: number // float
    ) {
        super();
    }

    serializeBytes(writer: ByteWriter): void {
        writer.writeInt32(this.weaponId);
        writer.writeInt32(this.skinId);
        writer.writeInt32(this.seed);
        writer.writeFloat(this.wear);
    }

    serializationLength(): number {
        return WeaponSkinDefinition.SERIALIZATION_LENGTH;
    }
}

export class ServerPlayer extends Serializable {
    static SERIALIZATION_LENGTH = 12;

    constructor(
        private steamId64: number, // int64
        private userId: number // int32
    ) {
        super();
    }

    serializeBytes(writer: ByteWriter): void {
        writer.writeInt64(this.steamId64);
        writer.writeInt32(this.userId);
    }

    serializationLength(): number {
        return ServerPlayer.SERIALIZATION_LENGTH;
    }
}

export class PlayerSkins implements Serializable {
    private skinsCollection: SerializableCollection<WeaponSkinDefinition>;

    constructor(
        private serverPlayer: ServerPlayer, // serializable
        private skins: WeaponSkinDefinition[] // serializable
    ) {
        this.skinsCollection = new SerializableCollection<WeaponSkinDefinition>(skins);
    }

    serializeBytes(writer: ByteWriter): void {
        this.serverPlayer.serializeBytes(writer);
        this.skinsCollection.serializeBytes(writer);
    }

    serializationLength(): number {
        return this.serverPlayer.serializationLength() + this.skinsCollection.serializationLength();
    }
}