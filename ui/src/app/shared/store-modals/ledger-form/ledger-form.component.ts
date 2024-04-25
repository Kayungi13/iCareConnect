import { Component, Inject, OnInit } from "@angular/core";
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from "@angular/material/legacy-dialog";
import { DateField } from "src/app/shared/modules/form/models/date-field.model";
import { Dropdown } from "src/app/shared/modules/form/models/dropdown.model";
import { Field } from "src/app/shared/modules/form/models/field.model";
import { FormValue } from "src/app/shared/modules/form/models/form-value.model";
import { TextArea } from "src/app/shared/modules/form/models/text-area.model";
import { Textbox } from "src/app/shared/modules/form/models/text-box.model";
import { LedgerInput } from "src/app/shared/resources/store/models/ledger-input.model";
import { LedgerTypeObject } from "src/app/shared/resources/store/models/ledger-type.model";
import { StockBatch } from "src/app/shared/resources/store/models/stock-batch.model";
import { StockObject } from "src/app/shared/resources/store/models/stock.model";
import { LedgerTypeService } from "../../resources/store/services/ledger-type.service";
import { Observable } from "rxjs";

@Component({
  selector: "app-ledger-form",
  templateUrl: "./ledger-form.component.html",
  styleUrls: ["./ledger-form.component.scss"],
})
export class LedgerFormComponent implements OnInit {
  ledgerFormValue: FormValue;
  ledgerFormFields: Field<string>[];
  isFormValid: boolean = false;
  ledgerTypes$: Observable<LedgerTypeObject[]>;
  ledgerTypes: any;
  constructor(
    private ledgerTypesService: LedgerTypeService,
    private dialogRef: MatDialogRef<LedgerFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      stock: StockObject;
      storeUuid: string;
      ledgerTypes: LedgerTypeObject[];
      operation: string;
      stockBatch: StockBatch;
    }
  ) {}

  get ledgerFormTitle(): string {
    if (!this.data?.stockBatch) {
      return "Add Batch";
    }

    return `Manage Batch`;
  }

  get ledgerDescription(): string {
    const stockBatch = this.data?.stockBatch;

    if (!stockBatch) {
      return undefined;
    }
    return `BatchNo: ${stockBatch.batchNo}, Expiry: ${stockBatch.remainingDays}, Quantity: ${stockBatch.quantity}`;
  }

  // ngOnInit() {

  //   this.getLedgerTypes();

  // }
  ngOnInit() {
    this.getLedgerTypes().then(() => {
      const stockBatch = this.data?.stockBatch;

      this.ledgerFormFields = [
        new Dropdown({
          id: "ledgerType",
          key: "ledgerType",
          label: "LedgerType",
          required: true,
          options: this.ledgerTypes.map((ledgerType) => ({
            key: ledgerType.id,
            label: ledgerType.name,
            value: ledgerType.id,
          })),
        }),
        new Textbox({
          id: "batchNo",
          key: "batchNo",
          label: "Batch",
          type: "text",
          required: !stockBatch ? true : false,
          value: stockBatch?.batchNo,
          hidden: stockBatch !== undefined,
        }),
        new Textbox({
          id: "quantity",
          key: "quantity",
          required: true,
          label: `Quantity${
            this.data?.operation === "DEDUCT"
              ? "(max: " + stockBatch.quantity + ")"
              : ""
          }`,
          type: "number",
          min: 0,
          max:
            this.data?.operation === "DEDUCT" ? stockBatch.quantity : undefined,
        }),
        new Textbox({
          id: "buyingPrice",
          key: "buyingPrice",
          label: "Buying Price",
          type: "number",
          value: stockBatch ? "0" : "",
          hidden: stockBatch !== undefined,
        }),
        new DateField({
          id: "expiryDate",
          key: "expiryDate",
          label: "Expiry Date",
          required: !stockBatch ? true : false,
          value: stockBatch?.expiryDate,
          hidden: stockBatch !== undefined,
        }),
        new TextArea({
          id: "remarks",
          key: "remarks",
          label: "Remarks",
          type: "textarea",
        }),
      ];
    });
  }

  getLedgerTypes(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.ledgerTypesService.getLedgerTypes().subscribe(
        (ledgerTypes: LedgerTypeObject[]) => {
          this.ledgerTypes = ledgerTypes;
          // console.log("ledgerTypes test------------------->", this.ledgerTypes);
          resolve();
        },
        (error) => {
          console.error("Error fetching ledger types", error);
          reject();
        }
      );
    });
  }

  onCancel(e: Event) {
    e.stopPropagation();
    this.dialogRef.close();
  }

  onUpdateForm(formValue: FormValue): void {
    this.ledgerFormValue = formValue;
    const values = this.ledgerFormValue.getValues();
    this.isFormValid = !this.data?.stockBatch
      ? formValue.isValid
      : values["ledgerType"]?.value && values["quantity"]?.value
      ? true
      : false;
  }

  onSaveLedger(e: Event, ledgerType: any): void {
    // console.log("test ledger type------------------>", ledgerType);
    e.stopPropagation();
    const formValues = this.ledgerFormValue.getValues();
    const ledgerInput: LedgerInput = {
      itemUuid: this.data?.stock?.id,
      ledgerTypeUuid: formValues?.ledgerType?.value,
      locationUuid: this.data?.storeUuid,
      quantity: parseInt(formValues?.quantity.value || "0", 10),
      buyingPrice: parseFloat(formValues?.buyingPrice?.value),
      batchNo: formValues?.batchNo?.value,
      expiryDate: formValues?.expiryDate?.value,
      remarks: formValues?.remarks?.value,
    };

    this.dialogRef.close({ ledgerInput });
  }
}
